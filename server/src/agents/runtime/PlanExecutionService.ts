import type { DynamicWorkflowPlan, DynamicPlanStep, ReplanTrigger } from "@ai-novel/shared/types/dynamicPlan";
import type { AgentRuntimeCallbacks, AgentRuntimeResult, PlannedAction, StructuredIntent, ToolCall, ToolExecutionContext } from "../types";
import { RunExecutionService } from "./RunExecutionService";
import { AgentTraceStore } from "../traceStore";
import { AgentPlanStore } from "../store/AgentPlanStore";

export interface PhaseExecutionResult {
  updatedPlan: DynamicWorkflowPlan;
  executionResult: AgentRuntimeResult;
  replanTrigger: ReplanTrigger | null;
  waitingForApproval: boolean;
}

function stepsToPlannedAction(phaseIndex: number, steps: DynamicPlanStep[]): PlannedAction[] {
  if (steps.length === 0) return [];
  const calls: ToolCall[] = steps.map((s) => ({
    tool: s.toolName as ToolCall["tool"],
    idempotencyKey: s.idempotencyKey,
    input: s.input,
    reason: s.reasoning,
  }));
  return [
    {
      agent: "Planner",
      reasoning: `执行阶段 ${phaseIndex}：共 ${calls.length} 个步骤`,
      calls,
    },
  ];
}

export class PlanExecutionService {
  constructor(
    private readonly executor: RunExecutionService,
    private readonly store: AgentTraceStore,
    private readonly planStore: AgentPlanStore,
  ) {}

  async executeCurrentPhase(
    plan: DynamicWorkflowPlan,
    runId: string,
    goal: string,
    context: Omit<ToolExecutionContext, "runId" | "agentName">,
    structuredIntent: StructuredIntent | undefined,
    failRun: (runId: string, message: string, agentName: string, callbacks?: AgentRuntimeCallbacks) => Promise<void>,
    callbacks?: AgentRuntimeCallbacks,
  ): Promise<PhaseExecutionResult> {
    const phase = plan.phases[plan.currentPhaseIndex];
    if (!phase) {
      throw new Error(`Dynamic plan phase index ${plan.currentPhaseIndex} out of bounds.`);
    }

    const startStepIndex = plan.currentStepPointer.stepIndex;
    const stepsToExecute = phase.candidateSteps.slice(startStepIndex);

    if (stepsToExecute.length === 0) {
      return {
        updatedPlan: plan,
        executionResult: {
          run: { id: runId, status: "succeeded" } as AgentRuntimeResult["run"],
          steps: [],
          approvals: [],
          assistantOutput: "",
        },
        replanTrigger: null,
        waitingForApproval: false,
      };
    }

    const plannedActions = stepsToPlannedAction(plan.currentPhaseIndex, stepsToExecute);

    const executionResult = await this.executor.runActionPlan(
      runId,
      goal,
      plannedActions,
      context,
      structuredIntent,
      failRun,
      callbacks,
      {
        dynamicPlan: plan,
        orchestrationMode: "dynamic",
        replanCount: plan.consecutiveReplanCount,
      },
    );

    if (executionResult.run.status === "waiting_approval") {
      return {
        updatedPlan: plan,
        executionResult,
        replanTrigger: null,
        waitingForApproval: true,
      };
    }

    if (executionResult.run.status === "failed") {
      const failedStep = stepsToExecute[0];
      if (failedStep) {
        failedStep.status = "failed";
      }
      phase.status = "failed";
      const trigger: ReplanTrigger = {
        condition: "step_failure",
        detail: executionResult.run.error ?? "步骤执行失败",
        failedStepTool: failedStep?.toolName,
        failedStepIdempotencyKey: failedStep?.idempotencyKey,
        suggestedAction: "检查失败原因并重规划剩余步骤",
      };

      plan.replanHistory.push(trigger);
      plan.consecutiveReplanCount += 1;
      plan.status = "failed";
      plan.updatedAt = new Date().toISOString();

      await this.planStore.updatePlanSnapshot(
        runId,
        plan.version,
        plan,
        plan.phases.reduce((sum, p) => sum + p.candidateSteps.filter((s) => s.status === "completed").length, 0),
        trigger,
      );

      return {
        updatedPlan: plan,
        executionResult,
        replanTrigger: trigger,
        waitingForApproval: false,
      };
    }

    const completedCount = startStepIndex + stepsToExecute.length;
    phase.status = "active";
    for (let i = startStepIndex; i < completedCount && i < phase.candidateSteps.length; i += 1) {
      phase.candidateSteps[i].status = "completed";
    }
    phase.status = "completed";
    plan.consecutiveReplanCount = 0;

    plan.currentPhaseIndex += 1;
    if (plan.currentPhaseIndex < plan.phases.length) {
      plan.currentStepPointer = { phaseIndex: plan.currentPhaseIndex, stepIndex: 0 };
      plan.phases[plan.currentPhaseIndex].status = "active";
    } else {
      plan.status = "completed";
    }
    plan.updatedAt = new Date().toISOString();

    await this.planStore.updatePlanSnapshot(
      runId,
      plan.version,
      plan,
      plan.phases.reduce((sum, p) => sum + p.candidateSteps.filter((s) => s.status === "completed").length, 0),
    );

    return {
      updatedPlan: plan,
      executionResult,
      replanTrigger: null,
      waitingForApproval: false,
    };
  }

  hasMorePhases(plan: DynamicWorkflowPlan): boolean {
    return plan.currentPhaseIndex < plan.phases.length && plan.status === "active";
  }

  async saveInitialPlan(runId: string, plan: DynamicWorkflowPlan): Promise<void> {
    await this.planStore.createPlanSnapshot(runId, plan.version, plan);
  }

  async resumeFromSnapshot(runId: string): Promise<DynamicWorkflowPlan | null> {
    return this.planStore.getLatestActivePlan(runId);
  }
}

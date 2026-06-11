import type { DynamicWorkflowPlan } from "@ai-novel/shared/types/dynamicPlan";
import { canAgentUseTool } from "../approvalPolicy";
import { getAgentToolDefinition } from "../toolRegistry";
import type { AgentToolName } from "../types";

export interface PlanValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateDynamicPlan(plan: DynamicWorkflowPlan): PlanValidationResult {
  const errors: string[] = [];
  const allSteps = plan.phases.flatMap((phase) => phase.candidateSteps);

  if (!plan.goal || !plan.goal.trim()) {
    errors.push("计划缺少目标 (goal)。");
  }

  if (!plan.phases || plan.phases.length === 0) {
    errors.push("计划缺少阶段 (phases)。");
    return { valid: false, errors };
  }

  for (let pi = 0; pi < plan.phases.length; pi += 1) {
    const phase = plan.phases[pi];
    if (!phase.objective || !phase.objective.trim()) {
      errors.push(`阶段 ${pi} (${phase.id}) 缺少目标 (objective)。`);
    }
    if (!phase.candidateSteps || phase.candidateSteps.length === 0) {
      errors.push(`阶段 ${pi} (${phase.id}) 缺少步骤 (candidateSteps)。`);
      continue;
    }

    for (let si = 0; si < phase.candidateSteps.length; si += 1) {
      const step = phase.candidateSteps[si];
      const stepLabel = `阶段 ${pi} 步骤 ${si} (${step.toolName})`;

      if (!step.toolName || typeof step.toolName !== "string") {
        errors.push(`${stepLabel}: 缺少工具名。`);
        continue;
      }

      const toolName = step.toolName as AgentToolName;
      try {
        getAgentToolDefinition(toolName);
      } catch {
        errors.push(`${stepLabel}: 工具 "${step.toolName}" 未在工具注册表中找到。`);
        continue;
      }

      if (!canAgentUseTool("Planner", toolName)) {
        errors.push(`${stepLabel}: Planner 无权调用 "${step.toolName}"。`);
      }

      if (step.isWrite && step.approvalRequired === undefined) {
        errors.push(`${stepLabel}: 写操作必须明确标注 approvalRequired。`);
      }
    }
  }

  const firstWriteIndex = allSteps.findIndex((step) => step.isWrite);
  const hasReadBeforeWrite = firstWriteIndex <= 0
    || allSteps.slice(0, firstWriteIndex).some((step) => !step.isWrite);
  if (firstWriteIndex > 0 && !hasReadBeforeWrite) {
    errors.push("动态计划缺少写前读取步骤。");
  }

  const queueIndex = allSteps.findIndex((step) => step.toolName === "queue_pipeline_run");
  if (queueIndex >= 0 && queueIndex !== allSteps.length - 1) {
    errors.push("queue_pipeline_run 必须是动态计划中的最后一步。");
  }

  return { valid: errors.length === 0, errors };
}

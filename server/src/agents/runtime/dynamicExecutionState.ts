import type { DynamicExecutionStateSummary } from "@ai-novel/shared/types/agent";
import type { DynamicWorkflowPlan, ReplanTrigger } from "@ai-novel/shared/types/dynamicPlan";

export function summarizeDynamicExecutionState(input: {
  dynamicPlan?: DynamicWorkflowPlan | null;
  waitingForApproval?: boolean;
  fallbackReason?: string | null;
  replanTrigger?: ReplanTrigger | null;
  mode?: DynamicExecutionStateSummary["mode"];
}): DynamicExecutionStateSummary {
  const plan = input.dynamicPlan ?? null;
  const fallbackMode = input.mode ?? (input.fallbackReason ? "dynamic_fallback_static" : plan ? "dynamic" : "static");
  if (!plan) {
    return {
      mode: fallbackMode,
      waitingForApproval: input.waitingForApproval === true,
      lastReplanReason: input.replanTrigger
        ? `${input.replanTrigger.condition}: ${input.replanTrigger.detail}`
        : null,
      fallbackReason: input.fallbackReason ?? null,
    };
  }

  const currentPhase = plan.phases[plan.currentPhaseIndex];
  const currentStep = currentPhase?.candidateSteps[plan.currentStepPointer.stepIndex];
  const remainingPhases = Math.max(plan.phases.length - plan.currentPhaseIndex, 0);
  const remainingSteps = plan.phases.reduce((sum, phase, phaseIndex) => {
    const startIndex = phaseIndex === plan.currentPhaseIndex ? plan.currentStepPointer.stepIndex : 0;
    if (phaseIndex < plan.currentPhaseIndex) {
      return sum;
    }
    return sum + Math.max(phase.candidateSteps.length - startIndex, 0);
  }, 0);

  const lastReplan = input.replanTrigger ?? plan.replanHistory[plan.replanHistory.length - 1] ?? null;

  return {
    mode: fallbackMode,
    currentPhase: currentPhase?.objective ?? null,
    currentStep: currentStep?.expectedOutput ?? null,
    remainingPhaseCount: remainingPhases,
    remainingStepCount: remainingSteps,
    waitingForApproval: input.waitingForApproval === true,
    lastReplanReason: lastReplan ? `${lastReplan.condition}: ${lastReplan.detail}` : null,
    fallbackReason: input.fallbackReason ?? null,
  };
}

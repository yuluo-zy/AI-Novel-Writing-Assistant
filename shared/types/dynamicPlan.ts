export type DynamicStepStatus = "pending" | "ready" | "running" | "completed" | "failed" | "skipped";
export type DynamicPhaseStatus = "pending" | "active" | "completed" | "failed";
export type DynamicPlanStatus = "draft" | "active" | "completed" | "failed" | "replanned";

export interface DynamicPlanStep {
  toolName: string;
  reasoning: string;
  input: Record<string, unknown>;
  idempotencyKey: string;
  expectedOutput: string;
  isWrite: boolean;
  approvalRequired: boolean;
  resourceRequirements?: {
    novelId?: boolean;
    worldId?: boolean;
    chapterId?: boolean;
  };
  status: DynamicStepStatus;
}

export interface DynamicPlanPhase {
  id: string;
  objective: string;
  candidateSteps: DynamicPlanStep[];
  status: DynamicPhaseStatus;
}

export interface ReplanTrigger {
  condition: "step_failure" | "missing_prerequisite" | "context_gap" | "permission_denied";
  detail: string;
  failedStepTool?: string;
  failedStepIdempotencyKey?: string;
  suggestedAction?: string;
}

export interface DynamicWorkflowPlan {
  id: string;
  goal: string;
  version: number;
  status: DynamicPlanStatus;
  phases: DynamicPlanPhase[];
  currentPhaseIndex: number;
  currentStepPointer: { phaseIndex: number; stepIndex: number };
  createdAt: string;
  updatedAt: string;
  parentVersionId?: string;
  replanHistory: ReplanTrigger[];
  consecutiveReplanCount: number;
}

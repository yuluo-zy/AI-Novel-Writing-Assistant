/** 动态步骤状态 */
export type DynamicStepStatus = "pending" | "ready" | "running" | "completed" | "failed" | "skipped";
/** 动态阶段状态 */
export type DynamicPhaseStatus = "pending" | "active" | "completed" | "failed";
/** 动态计划状态 */
export type DynamicPlanStatus = "draft" | "active" | "completed" | "failed" | "replanned";

/** 动态计划中的单个步骤 */
export interface DynamicPlanStep {
  /** 要调用的工具名称 */
  toolName: string;
  /** 选择该步骤的推理过程 */
  reasoning: string;
  /** 步骤输入参数 */
  input: Record<string, unknown>;
  /** 幂等键 */
  idempotencyKey: string;
  /** 预期输出描述 */
  expectedOutput: string;
  /** 是否为写操作 */
  isWrite: boolean;
  /** 是否需要审批 */
  approvalRequired: boolean;
  /** 资源需求声明 */
  resourceRequirements?: {
    novelId?: boolean;
    worldId?: boolean;
    chapterId?: boolean;
  };
  /** 步骤状态 */
  status: DynamicStepStatus;
}

/** 动态计划阶段 */
export interface DynamicPlanPhase {
  id: string;
  /** 阶段目标 */
  objective: string;
  /** 候选步骤列表 */
  candidateSteps: DynamicPlanStep[];
  /** 阶段状态 */
  status: DynamicPhaseStatus;
}

/** 重规划触发器 */
export interface ReplanTrigger {
  /** 触发条件 */
  condition: "step_failure" | "missing_prerequisite" | "context_gap" | "permission_denied";
  /** 详细信息 */
  detail: string;
  /** 失败步骤的工具名称 */
  failedStepTool?: string;
  /** 失败步骤的幂等键 */
  failedStepIdempotencyKey?: string;
  /** 建议的补救措施 */
  suggestedAction?: string;
}

/** 动态工作流计划 */
export interface DynamicWorkflowPlan {
  id: string;
  /** 总体目标 */
  goal: string;
  /** 版本号 */
  version: number;
  /** 计划状态 */
  status: DynamicPlanStatus;
  /** 阶段列表 */
  phases: DynamicPlanPhase[];
  /** 当前阶段索引 */
  currentPhaseIndex: number;
  /** 当前步骤指针 */
  currentStepPointer: { phaseIndex: number; stepIndex: number };
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 父版本 ID（重规划时使用） */
  parentVersionId?: string;
  /** 重规划历史 */
  replanHistory: ReplanTrigger[];
  /** 连续重规划次数 */
  consecutiveReplanCount: number;
}

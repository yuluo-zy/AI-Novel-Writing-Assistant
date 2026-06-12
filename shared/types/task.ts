import type { ResourceRef } from "./agent";
import type {
  NovelWorkflowCheckpoint,
  NovelWorkflowResumeTarget,
} from "./novelWorkflow";

/** 任务种类 */
export type TaskKind =
  | "book_analysis"
  | "novel_pipeline"
  | "knowledge_document"
  | "image_generation"
  | "agent_run"
  | "novel_workflow"
  | "style_extraction";

/** 任务状态 */
export type TaskStatus = "queued" | "running" | "waiting_approval" | "succeeded" | "failed" | "cancelled";

/** 任务 token 用量摘要 */
export interface TaskTokenUsageSummary {
  /** 提示词 token 数 */
  promptTokens: number;
  /** 补全 token 数 */
  completionTokens: number;
  /** 总 token 数 */
  totalTokens: number;
  /** LLM 调用次数 */
  llmCallCount: number;
  /** 最后记录时间 */
  lastRecordedAt?: string | null;
}

/** 统一任务步骤 */
export interface UnifiedTaskStep {
  /** 步骤键 */
  key: string;
  /** 步骤标签 */
  label: string;
  /** 步骤状态 */
  status: "idle" | "running" | "succeeded" | "failed" | "cancelled";
  /** 开始时间 */
  startedAt?: string | null;
  /** 更新时间 */
  updatedAt?: string | null;
}

/** 统一任务摘要 */
export interface UnifiedTaskSummary {
  id: string;
  /** 任务种类 */
  kind: TaskKind;
  /** 任务标题 */
  title: string;
  /** 任务状态 */
  status: TaskStatus;
  /** 是否需要手动恢复 */
  pendingManualRecovery?: boolean;
  /** 进度 (0-100) */
  progress: number;
  /** 当前阶段 */
  currentStage?: string | null;
  /** 当前项键 */
  currentItemKey?: string | null;
  /** 当前项标签 */
  currentItemLabel?: string | null;
  /** 执行范围标签 */
  executionScopeLabel?: string | null;
  /** 显示状态 */
  displayStatus?: string | null;
  /** 阻塞原因 */
  blockingReason?: string | null;
  /** 恢复操作 */
  resumeAction?: string | null;
  /** 最后健康阶段 */
  lastHealthyStage?: string | null;
  /** 尝试次数 */
  attemptCount: number;
  /** 最大尝试次数 */
  maxAttempts: number;
  /** 最后错误 */
  lastError?: string | null;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 心跳时间 */
  heartbeatAt?: string | null;
  /** 所有者 ID */
  ownerId: string;
  /** 所有者标签 */
  ownerLabel: string;
  /** 来源路由 */
  sourceRoute: string;
  /** 检查点类型 */
  checkpointType?: NovelWorkflowCheckpoint | null;
  /** 检查点摘要 */
  checkpointSummary?: string | null;
  /** 恢复目标 */
  resumeTarget?: NovelWorkflowResumeTarget | null;
  /** 下一步操作标签 */
  nextActionLabel?: string | null;
  /** 通知编码 */
  noticeCode?: string | null;
  /** 通知摘要 */
  noticeSummary?: string | null;
  /** 失败编码 */
  failureCode?: string | null;
  /** 失败摘要 */
  failureSummary?: string | null;
  /** 恢复提示 */
  recoveryHint?: string | null;
  /** token 用量 */
  tokenUsage?: TaskTokenUsageSummary | null;
  /** 来源资源 */
  sourceResource?: ResourceRef | null;
  /** 目标资源列表 */
  targetResources?: ResourceRef[];
}

/** 统一任务详情 */
export interface UnifiedTaskDetail extends UnifiedTaskSummary {
  /** LLM 提供商 */
  provider?: string | null;
  /** 模型名称 */
  model?: string | null;
  /** 开始时间 */
  startedAt?: string | null;
  /** 完成时间 */
  finishedAt?: string | null;
  /** 重试次数描述 */
  retryCountLabel: string;
  /** 元数据 */
  meta: Record<string, unknown>;
  /** 步骤列表 */
  steps: UnifiedTaskStep[];
  /** 失败详情 */
  failureDetails?: string | null;
}

/** 统一任务列表响应 */
export interface UnifiedTaskListResponse {
  /** 任务列表 */
  items: UnifiedTaskSummary[];
  /** 下一页游标 */
  nextCursor?: string | null;
}

/** 任务概览摘要 */
export interface TaskOverviewSummary {
  /** 排队中数量 */
  queuedCount: number;
  /** 运行中数量 */
  runningCount: number;
  /** 失败数量 */
  failedCount: number;
  /** 已取消数量 */
  cancelledCount: number;
  /** 等待审批数量 */
  waitingApprovalCount: number;
  /** 可恢复候选数量 */
  recoveryCandidateCount: number;
}

/** 可恢复任务摘要 */
export interface RecoverableTaskSummary {
  id: string;
  /** 任务种类 */
  kind: Extract<TaskKind, "book_analysis" | "novel_pipeline" | "image_generation" | "novel_workflow" | "style_extraction">;
  /** 任务标题 */
  title: string;
  /** 所有者标签 */
  ownerLabel: string;
  /** 状态 */
  status: Extract<TaskStatus, "queued" | "running">;
  /** 当前阶段 */
  currentStage?: string | null;
  /** 当前项标签 */
  currentItemLabel?: string | null;
  /** 恢复操作 */
  resumeAction?: string | null;
  /** 来源路由 */
  sourceRoute: string;
  /** 恢复提示 */
  recoveryHint?: string | null;
}

/** 可恢复任务列表响应 */
export interface RecoverableTaskListResponse {
  /** 可恢复任务列表 */
  items: RecoverableTaskSummary[];
}

import type { NovelWorkflowCheckpoint } from "./novelWorkflow";
import type { TaskStatus, UnifiedTaskDetail } from "./task";
import type {
  AutoDirectorAffectedScope,
  AutoDirectorFollowUpSection,
  AutoDirectorValidationResult,
  AutoDirectorValidationRequiredAction,
} from "./autoDirectorValidation";

/**
 * 自动导演跟进原因
 * 描述自动导演流程为何进入跟进状态
 */
export const AUTO_DIRECTOR_FOLLOW_UP_REASONS = [
  "manual_recovery_required",
  "runtime_failed",
  "candidate_selection_required",
  "replan_required",
  "runtime_cancelled",
  "chapter_batch_execution_pending",
  "quality_repair_pending",
  "auto_progress_running",
  "auto_approval_completed",
  "runtime_replaced",
  "validation_required",
] as const;

export type AutoDirectorFollowUpReason = (typeof AUTO_DIRECTOR_FOLLOW_UP_REASONS)[number];

/** 自动导演跟进优先级 */
export type AutoDirectorFollowUpPriority = "P0" | "P1" | "P2";

/** 自动导演操作风险等级 */
export type AutoDirectorActionRiskLevel = "low" | "medium" | "high";

/** 自动导演变更型操作编码 */
export type AutoDirectorMutationActionCode =
  | "continue_auto_execution"
  | "continue_generic"
  | "auto_backfill_structured_outline"
  | "retry_with_task_model"
  | "retry_with_route_model"
  | "safe_fix_validation";

/** 自动导演导航型操作编码 */
export type AutoDirectorNavigationActionCode =
  | "go_replan"
  | "go_candidate_selection"
  | "open_detail"
  | "open_follow_up_center";

/** 自动导演操作编码联合 */
export type AutoDirectorActionCode = AutoDirectorMutationActionCode | AutoDirectorNavigationActionCode;

/** 自动导演操作 */
export interface AutoDirectorAction {
  code: AutoDirectorActionCode;
  /** 操作种类（变更 / 导航） */
  kind: "mutation" | "navigation";
  /** 操作标签 */
  label: string;
  /** 风险等级 */
  riskLevel: AutoDirectorActionRiskLevel;
  /** 是否需要用户确认 */
  requiresConfirm: boolean;
  /** 关联的执行器操作编码 */
  executorActionCode?: AutoDirectorMutationActionCode;
  /** 目标 URL */
  targetUrl?: string;
  /** 深层链接 */
  deepLink?: string;
}

/** 自动导演渠道能力 */
export interface AutoDirectorChannelCapabilities {
  dingtalk: boolean;
  wecom: boolean;
}

/** 跟进原因解析器输入 */
export interface AutoDirectorFollowUpResolverInput {
  status: TaskStatus;
  checkpointType?: NovelWorkflowCheckpoint | null;
  pendingManualRecovery?: boolean;
  executionScopeLabel?: string | null;
  replacementTaskId?: string | null;
  validationResult?: AutoDirectorValidationResult | null;
}

/** 已解析的跟进原因 */
export interface AutoDirectorResolvedFollowUpReason {
  reason: AutoDirectorFollowUpReason;
  reasonLabel: string;
  priority: AutoDirectorFollowUpPriority;
  availableActions: AutoDirectorAction[];
  batchActionCodes: AutoDirectorMutationActionCode[];
  supportsBatch: boolean;
  channelCapabilities: AutoDirectorChannelCapabilities;
}

/** 自动导演渠道类型 */
export const AUTO_DIRECTOR_CHANNEL_TYPES = ["dingtalk", "wecom"] as const;

export type AutoDirectorChannelType = (typeof AUTO_DIRECTOR_CHANNEL_TYPES)[number];

/** 按原因统计的计数器 */
export type AutoDirectorCountersByReason = Record<AutoDirectorFollowUpReason, number>;
/** 按区间统计的计数器 */
export type AutoDirectorCountersBySection = Record<AutoDirectorFollowUpSection, number>;

/** 自动导演跟进验证摘要 */
export interface AutoDirectorFollowUpValidationSummary {
  blockingReasons: string[];
  warnings: string[];
  requiredActions: AutoDirectorValidationRequiredAction[];
  affectedScope: AutoDirectorAffectedScope | null;
  nextAction: string | null;
}

/** 自动导演跟进项 */
export interface AutoDirectorFollowUpItem {
  /** 项目类型 */
  itemType: "task" | "auto_approval_record";
  /** 导演任务 ID */
  directorTaskId: string;
  /** @deprecated 使用 directorTaskId */
  taskId: string;
  autoApprovalRecordId?: string;
  novelId: string | null;
  novelTitle: string;
  taskTitle: string;
  lane: "auto_director";
  status: TaskStatus;
  currentStage: string | null;
  checkpointType: NovelWorkflowCheckpoint | null;
  reason: AutoDirectorFollowUpReason;
  section: AutoDirectorFollowUpSection;
  reasonLabel: string;
  priority: AutoDirectorFollowUpPriority;
  followUpSummary: string;
  blockingReason: string | null;
  validationSummary?: AutoDirectorFollowUpValidationSummary | null;
  executionScope: string | null;
  currentModel: string | null;
  availableActions: AutoDirectorAction[];
  batchActionCodes: AutoDirectorMutationActionCode[];
  supportsBatch: boolean;
  channelCapabilities: AutoDirectorChannelCapabilities;
  pendingManualRecovery: boolean;
  lastMilestoneAt: string | null;
  updatedAt: string;
}

/** 自动导演跟进里程碑 */
export interface AutoDirectorFollowUpMilestone {
  label: string;
  at: string;
  status: TaskStatus;
  summary?: string | null;
}

/** 自动导演跟进详情 */
export interface AutoDirectorFollowUpDetail {
  directorTaskId: string;
  /** @deprecated 使用 directorTaskId */
  taskId: string;
  reasonLabel: string;
  priority: AutoDirectorFollowUpPriority;
  followUpSummary: string;
  checkpointSummary: string | null;
  blockingReason: string | null;
  nextStepSuggestion: string | null;
  validationSummary: AutoDirectorFollowUpValidationSummary | null;
  currentModel: string | null;
  riskNote: string | null;
  originDetailUrl: string;
  replanUrl: string | null;
  candidateSelectionUrl: string | null;
  availableActions: AutoDirectorAction[];
  milestones: AutoDirectorFollowUpMilestone[];
  channelDeliveries?: AutoDirectorChannelDeliveryStatus[];
  task: UnifiedTaskDetail;
}

/** 自动导演跟进总览 */
export interface AutoDirectorFollowUpOverview {
  totalCount: number;
  countersByReason: AutoDirectorCountersByReason;
  countersBySection: AutoDirectorCountersBySection;
}

/** 自动导演跟进摘要计数器 */
export interface AutoDirectorFollowUpSummaryCounters {
  recoveredToday: number;
  completedToday: number;
}

/** 自动导演跟进可用筛选 */
export interface AutoDirectorFollowUpAvailableFilters {
  sections: AutoDirectorFollowUpSection[];
  reasons: AutoDirectorFollowUpReason[];
  statuses: TaskStatus[];
  channelTypes: AutoDirectorChannelType[];
}

/** 自动导演跟进分页 */
export interface AutoDirectorFollowUpPagination {
  page: number;
  pageSize: number;
  total: number;
}

/** 自动导演跟进列表响应 */
export interface AutoDirectorFollowUpListResponse {
  items: AutoDirectorFollowUpItem[];
  countersByReason: AutoDirectorCountersByReason;
  countersBySection: AutoDirectorCountersBySection;
  summaryCounters: AutoDirectorFollowUpSummaryCounters;
  availableFilters: AutoDirectorFollowUpAvailableFilters;
  pagination: AutoDirectorFollowUpPagination;
}

/** 自动导演跟进列表查询输入 */
export interface AutoDirectorFollowUpListInput {
  section?: AutoDirectorFollowUpSection;
  reason?: AutoDirectorFollowUpReason;
  status?: TaskStatus;
  novelId?: string;
  supportsBatch?: boolean;
  channelType?: AutoDirectorChannelType;
  page?: number;
  pageSize?: number;
}

/** 自动导演操作请求 */
export interface AutoDirectorActionRequest {
  directorTaskId?: string;
  /** @deprecated 使用 directorTaskId */
  taskId: string;
  actionCode: AutoDirectorMutationActionCode;
  source: "web" | "dingtalk" | "wecom";
  operatorId: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}

/** 自动导演操作执行结果编码 */
export const AUTO_DIRECTOR_ACTION_RESULT_CODES = [
  "executed",
  "already_processed",
  "state_changed",
  "forbidden",
  "failed",
] as const;

export type AutoDirectorActionResultCode = (typeof AUTO_DIRECTOR_ACTION_RESULT_CODES)[number];

/** 自动导演操作执行结果 */
export interface AutoDirectorActionExecutionResult {
  directorTaskId?: string;
  /** @deprecated 使用 directorTaskId */
  taskId: string;
  actionCode: AutoDirectorMutationActionCode;
  code: AutoDirectorActionResultCode;
  message: string;
  task?: UnifiedTaskDetail | null;
}

/** 自动导演批量操作请求 */
export interface AutoDirectorBatchActionRequest {
  actionCode: AutoDirectorMutationActionCode;
  taskIds: string[];
  source: "web" | "dingtalk" | "wecom";
  operatorId: string;
  batchRequestKey: string;
  metadata?: Record<string, unknown>;
}

/** 自动导演批量操作结果编码 */
export const AUTO_DIRECTOR_BATCH_RESULT_CODES = [
  "success",
  "partial_success",
  "failed",
  "skipped",
] as const;

export type AutoDirectorBatchResultCode = (typeof AUTO_DIRECTOR_BATCH_RESULT_CODES)[number];

/** 自动导演批量操作执行结果 */
export interface AutoDirectorBatchActionExecutionResult {
  code: AutoDirectorBatchResultCode;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  itemResults: AutoDirectorActionExecutionResult[];
}

/** 自动导演事件类型 */
export const AUTO_DIRECTOR_EVENT_TYPES = [
  "auto_director.approval_required",
  "auto_director.auto_approved",
  "auto_director.exception",
  "auto_director.recovered",
  "auto_director.completed",
  "auto_director.progress_changed",
] as const;

export type AutoDirectorEventType = (typeof AUTO_DIRECTOR_EVENT_TYPES)[number];

/** 自动导演事件 */
export interface AutoDirectorEvent {
  eventId: string;
  eventType: AutoDirectorEventType;
  directorTaskId?: string;
  /** @deprecated 使用 directorTaskId */
  taskId: string;
  novelId: string | null;
  reason: AutoDirectorFollowUpReason | null;
  actionCandidates: AutoDirectorMutationActionCode[];
  summary: string;
  progressBucket: number | null;
  stage: string | null;
  checkpointType: NovelWorkflowCheckpoint | null;
  occurredAt: string;
}

/** 自动导演渠道操作回调 */
export interface AutoDirectorChannelActionCallback {
  endpoint: string;
  token: string;
  callbackId: string;
}

/** 自动导演渠道操作 */
export interface AutoDirectorChannelAction {
  actionCode: AutoDirectorActionCode;
  label: string;
  kind: "callback" | "link";
  callback?: AutoDirectorChannelActionCallback;
  url?: string;
}

/** 自动导演渠道卡片负载 */
export interface AutoDirectorChannelCardPayload {
  title: string;
  summary: string;
  reasonLabel: string | null;
  stage: string | null;
  checkpointSummary: string | null;
  actions: AutoDirectorChannelAction[];
}

/** 自动导演渠道通知负载 */
export interface AutoDirectorChannelNotificationPayload {
  channelType: AutoDirectorChannelType;
  event?: AutoDirectorEvent;
  card?: AutoDirectorChannelCardPayload;
  task?: {
    directorTaskId?: string;
    /** @deprecated 使用 directorTaskId */
    taskId: string;
    novelId: string | null;
    novelTitle: string;
    followUpCenterUrl: string;
    detailUrl: string;
  };
  msgtype?: "markdown";
  markdown?: {
    content: string;
  };
}

/** 自动导演通知状态 */
export const AUTO_DIRECTOR_NOTIFICATION_STATUSES = [
  "pending",
  "delivered",
  "failed",
] as const;

export type AutoDirectorNotificationStatus = (typeof AUTO_DIRECTOR_NOTIFICATION_STATUSES)[number];

/** 自动导演渠道投递状态 */
export interface AutoDirectorChannelDeliveryStatus {
  channelType: AutoDirectorChannelType;
  status: AutoDirectorNotificationStatus;
  deliveredAt: string | null;
  responseStatus: number | null;
  eventType: AutoDirectorEventType;
  target: string | null;
}

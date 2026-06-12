import type { DynamicExecutionStateSummary, FailureDiagnostic } from "./agent";

/** 创意中心线程状态 */
export type CreativeHubThreadStatus = "idle" | "busy" | "interrupted" | "error";
/** 创意中心轮次状态 */
export type CreativeHubTurnStatus = "running" | "succeeded" | "interrupted" | "failed" | "cancelled";

/** 创意中心资源绑定 */
export interface CreativeHubResourceBinding {
  novelId?: string | null;
  chapterId?: string | null;
  worldId?: string | null;
  taskId?: string | null;
  bookAnalysisId?: string | null;
  formulaId?: string | null;
  styleProfileId?: string | null;
  baseCharacterId?: string | null;
  knowledgeDocumentIds?: string[];
}

/** 创意中心工具调用 */
export interface CreativeHubToolCall {
  id: string;
  /** 工具名称 */
  name: string;
  /** 调用参数 */
  args: Record<string, unknown>;
  /** 部分 JSON（流式） */
  partial_json?: string;
}

/** 创意中心消息 */
export interface CreativeHubMessage {
  id?: string;
  /** 消息类型 */
  type: "system" | "human" | "ai" | "tool";
  /** 消息内容 */
  content: string | Record<string, unknown>[];
  /** 发送者名称 */
  name?: string;
  /** 工具调用 ID */
  tool_call_id?: string;
  /** 工具调用状态 */
  status?: "success" | "error";
  /** 工具调用列表 */
  tool_calls?: CreativeHubToolCall[];
  /** 附加参数 */
  additional_kwargs?: Record<string, unknown>;
}

/** 创意中心中断 */
export interface CreativeHubInterrupt {
  id: string;
  runId?: string | null;
  approvalId?: string | null;
  /** 中断标题 */
  title: string;
  /** 中断摘要 */
  summary: string;
  /** 目标类型 */
  targetType?: string | null;
  /** 目标 ID */
  targetId?: string | null;
  /** 是否可恢复 */
  resumable?: boolean;
  /** 元数据 */
  metadata?: Record<string, unknown> | null;
  /** 创建时间 */
  createdAt?: string | null;
}

/** 创意中心检查点引用 */
export interface CreativeHubCheckpointRef {
  /** 检查点 ID */
  checkpointId: string;
  /** 父检查点 ID */
  parentCheckpointId?: string | null;
  /** 运行 ID */
  runId?: string | null;
  /** 消息数量 */
  messageCount: number;
  /** 预览 */
  preview?: string | null;
  /** 创建时间 */
  createdAt: string;
}

/** 创意中心生产阶段 */
export interface CreativeHubProductionStage {
  /** 阶段键 */
  key: string;
  /** 阶段标签 */
  label: string;
  /** 阶段状态 */
  status: "pending" | "completed" | "running" | "blocked";
  /** 详情 */
  detail?: string | null;
}

/** 创意中心生产状态 */
export interface CreativeHubProductionStatus {
  /** 小说 ID */
  novelId: string;
  worldId?: string | null;
  /** 小说标题 */
  title: string;
  /** 已完成章节数 */
  chapterCount: number;
  /** 目标章节数 */
  targetChapterCount: number;
  /** 资产阶段列表 */
  assetStages: CreativeHubProductionStage[];
  /** 管道任务 ID */
  pipelineJobId?: string | null;
  /** 管道状态 */
  pipelineStatus?: string | null;
  /** 当前阶段 */
  currentStage: string;
  /** 失败摘要 */
  failureSummary?: string | null;
  /** 恢复提示 */
  recoveryHint?: string | null;
  /** 资产是否就绪 */
  assetsReady: boolean;
  /** 管道是否就绪 */
  pipelineReady: boolean;
  /** 摘要 */
  summary: string;
}

/** 创意中心小说设置阶段 */
export type CreativeHubNovelSetupStage =
  | "setup_in_progress"
  | "ready_for_planning"
  | "ready_for_production";

/** 创意中心小说设置项状态 */
export type CreativeHubNovelSetupItemStatus = "missing" | "partial" | "ready";
/** 创意中心小说设置检查项键 */
export type CreativeHubNovelSetupChecklistKey =
  | "premise"
  | "story_promise"
  | "direction"
  | "story_mode"
  | "narrative"
  | "production_preferences"
  | "chapter_scale"
  | "world"
  | "world_rules"
  | "characters"
  | "outline";

/** 创意中心小说设置检查项 */
export interface CreativeHubNovelSetupChecklistItem {
  /** 检查项键 */
  key: CreativeHubNovelSetupChecklistKey;
  /** 检查项标签 */
  label: string;
  /** 状态 */
  status: CreativeHubNovelSetupItemStatus;
  /** 摘要 */
  summary: string;
  /** 是否为生产所需 */
  requiredForProduction?: boolean;
  /** 当前值 */
  currentValue?: string | null;
  /** 建议操作 */
  recommendedAction?: string;
  /** 选项提示 */
  optionPrompt?: string;
}

/** 创意中心小说设置状态 */
export interface CreativeHubNovelSetupStatus {
  /** 小说 ID */
  novelId: string;
  /** 小说标题 */
  title: string;
  /** 设置阶段 */
  stage: CreativeHubNovelSetupStage;
  /** 完成比例 */
  completionRatio: number;
  /** 已完成项数 */
  completedCount: number;
  /** 总项数 */
  totalCount: number;
  /** 缺失项列表 */
  missingItems: string[];
  /** 下一个问题 */
  nextQuestion: string;
  /** 建议操作 */
  recommendedAction: string;
  /** 检查清单 */
  checklist: CreativeHubNovelSetupChecklistItem[];
}

/** 创意中心轮次摘要 */
export interface CreativeHubTurnSummary {
  runId: string;
  /** 检查点 ID */
  checkpointId: string | null;
  /** 轮次状态 */
  status: CreativeHubTurnStatus;
  /** 当前阶段 */
  currentStage: string;
  /** 意图摘要 */
  intentSummary: string;
  /** 操作摘要 */
  actionSummary: string;
  /** 影响摘要 */
  impactSummary: string;
  /** 下一步建议 */
  nextSuggestion: string;
  /** 当前计划阶段 */
  currentPlanPhase?: string;
  /** 当前步骤描述 */
  currentStepDescription?: string;
  /** 等待原因 */
  waitReason?: string;
  /** 最后重规划原因 */
  lastReplanReason?: string;
  /** 动态执行状态 */
  orchestration?: DynamicExecutionStateSummary | null;
}

/** 创意中心线程元数据 */
export interface CreativeHubThreadMetadata {
  productionStatus?: CreativeHubProductionStatus | null;
  novelSetup?: CreativeHubNovelSetupStatus | null;
  latestTurnSummary?: CreativeHubTurnSummary | null;
  dynamicExecutionState?: DynamicExecutionStateSummary | null;
  [key: string]: unknown;
}

/** 创意中心线程 */
export interface CreativeHubThread {
  id: string;
  /** 线程标题 */
  title: string;
  /** 是否已归档 */
  archived: boolean;
  /** 线程状态 */
  status: CreativeHubThreadStatus;
  /** 最新运行 ID */
  latestRunId?: string | null;
  /** 最新错误 */
  latestError?: string | null;
  /** 资源绑定 */
  resourceBindings: CreativeHubResourceBinding;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 创意中心线程状态 */
export interface CreativeHubThreadState {
  /** 线程信息 */
  thread: CreativeHubThread;
  /** 消息列表 */
  messages: CreativeHubMessage[];
  /** 中断列表 */
  interrupts: CreativeHubInterrupt[];
  /** 当前检查点 ID */
  currentCheckpointId?: string | null;
  /** 诊断信息 */
  diagnostics?: FailureDiagnostic;
  /** 元数据 */
  metadata?: CreativeHubThreadMetadata | null;
}

/** 创意中心线程历史项 */
export interface CreativeHubThreadHistoryItem extends CreativeHubCheckpointRef {
  /** 消息列表 */
  messages: CreativeHubMessage[];
  /** 中断列表 */
  interrupts: CreativeHubInterrupt[];
}

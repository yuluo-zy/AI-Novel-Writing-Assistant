/** 小说工作流车道类型 */
export type NovelWorkflowLane = "manual_create" | "auto_director";

/** 小说工作流阶段 */
export type NovelWorkflowStage =
  | "project_setup"
  | "auto_director"
  | "story_macro"
  | "character_setup"
  | "volume_strategy"
  | "structured_outline"
  | "chapter_execution"
  | "quality_repair";

/** 小说工作流检查点类型 */
export type NovelWorkflowCheckpoint =
  | "candidate_selection_required"
  | "book_contract_ready"
  | "character_setup_required"
  | "volume_strategy_ready"
  | "chapter_batch_ready"
  | "replan_required"
  | "workflow_completed";

/** 小说工作流里程碑类型（含检查点和重写快照） */
export type NovelWorkflowMilestoneType =
  | NovelWorkflowCheckpoint
  | "rewrite_snapshot_created";

/** 小说工作流里程碑 */
export interface NovelWorkflowMilestone {
  /** 检查点类型 */
  checkpointType: NovelWorkflowMilestoneType;
  /** 摘要 */
  summary: string;
  /** 创建时间 */
  createdAt: string;
}

/** 小说工作流恢复目标 */
export interface NovelWorkflowResumeTarget {
  /** 路由路径 */
  route: "/novels/create" | "/novels/:id/edit";
  /** 小说 ID */
  novelId?: string | null;
  /** 任务 ID */
  taskId?: string | null;
  /** 工作流车道 */
  lane?: NovelWorkflowLane | null;
  /** 阶段标签 */
  stage?: "basic" | "story_macro" | "character" | "outline" | "structured" | "chapter" | "pipeline";
  /** 章节 ID */
  chapterId?: string | null;
  /** 卷 ID */
  volumeId?: string | null;
  /** 模式 */
  mode?: "director" | null;
}

/** 书籍创作约定 */
export interface BookContract {
  id: string;
  /** 所属小说 ID */
  novelId: string;
  /** 阅读承诺 */
  readingPromise: string;
  /** 主角幻想 */
  protagonistFantasy: string;
  /** 核心卖点 */
  coreSellingPoint: string;
  /** 第 3 章回报 */
  chapter3Payoff: string;
  /** 第 10 章回报 */
  chapter10Payoff: string;
  /** 第 30 章回报 */
  chapter30Payoff: string;
  /** 升级阶梯 */
  escalationLadder: string;
  /** 关系主线 */
  relationshipMainline: string;
  /** 绝对红线 */
  absoluteRedLines: string[];
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 书籍创作约定草稿（不含 ID） */
export interface BookContractDraft {
  readingPromise: string;
  protagonistFantasy: string;
  coreSellingPoint: string;
  chapter3Payoff: string;
  chapter10Payoff: string;
  chapter30Payoff: string;
  escalationLadder: string;
  relationshipMainline: string;
  absoluteRedLines: string[];
}

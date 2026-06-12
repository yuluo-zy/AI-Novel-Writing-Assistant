import type {
  AutoDirectorMutationActionCode,
} from "./autoDirectorFollowUp";
import type {
  DirectorTakeoverEntryStep,
  DirectorTakeoverRequest,
} from "./novelDirector";
import type { NovelWorkflowCheckpoint } from "./novelWorkflow";
import type { TaskStatus } from "./task";

/** 自动导演验证来源 */
export type AutoDirectorValidationSource =
  | "takeover"
  | "continue"
  | "retry"
  | "follow_up_action"
  | "batch_action"
  | "channel_callback"
  | "web"
  | "dingtalk"
  | "wecom";

/** 自动导演影响范围（书籍 / 章节范围 / 卷） */
export type AutoDirectorAffectedScope =
  | {
      type: "book";
      label: string;
    }
  | {
      type: "chapter_range";
      label: string;
      startOrder: number;
      endOrder: number;
    }
  | {
      type: "volume";
      label: string;
      volumeOrder: number;
    };

/** 自动导演验证必需操作编码 */
export type AutoDirectorValidationRequiredActionCode =
  | "clear_checkpoint"
  | "clear_failure"
  | "create_rewrite_snapshot"
  | "cancel_replaced_tasks"
  | "reset_downstream_state"
  | "revalidate_assets"
  | "auto_backfill_structured_outline";

/** 自动导演验证必需操作 */
export interface AutoDirectorValidationRequiredAction {
  /** 操作编码 */
  code: AutoDirectorValidationRequiredActionCode;
  /** 操作标签 */
  label: string;
  /** 风险等级 */
  riskLevel: "low" | "medium" | "high";
  /** 是否可安全自动修复 */
  safeToAutoFix: boolean;
}

/** 自动导演验证结果 */
export interface AutoDirectorValidationResult {
  /** 是否允许继续 */
  allowed: boolean;
  /** 阻塞原因列表 */
  blockingReasons: string[];
  /** 警告列表 */
  warnings: string[];
  /** 必需操作列表 */
  requiredActions: AutoDirectorValidationRequiredAction[];
  /** 影响范围 */
  affectedScope: AutoDirectorAffectedScope;
  /** 下一个检查点 */
  nextCheckpoint?: NovelWorkflowCheckpoint | null;
  /** 下一步操作描述 */
  nextAction?: string | null;
}

/** 自动导演验证资产快照 */
export interface AutoDirectorValidationAssetSnapshot {
  hasProjectSetup?: boolean;
  hasStoryMacroPlan?: boolean;
  hasBookContract?: boolean;
  characterCount?: number;
  volumeCount?: number;
  hasVolumeStrategyPlan?: boolean;
  hasStructuredOutline?: boolean;
  plannedChapterCount?: number | null;
  totalChapterCount?: number | null;
  volumeChapterRanges?: Array<{
    volumeOrder: number;
    startOrder: number;
    endOrder: number;
  }>;
  structuredOutlineChapterOrders?: number[];
}

/** 接管验证输入 */
export interface AutoDirectorTakeoverValidationInput {
  source: AutoDirectorValidationSource;
  request: Pick<DirectorTakeoverRequest, "novelId" | "entryStep" | "strategy" | "autoExecutionPlan" | "runMode">;
  assets: AutoDirectorValidationAssetSnapshot;
}

/** 操作验证任务快照 */
export interface AutoDirectorActionValidationTaskSnapshot {
  id: string;
  lane?: string | null;
  status: TaskStatus | string;
  checkpointType?: NovelWorkflowCheckpoint | string | null;
  pendingManualRecovery?: boolean | null;
  novelId?: string | null;
  seedPayload?: {
    autoExecution?: {
      enabled?: boolean;
      scopeLabel?: string | null;
      startOrder?: number;
      endOrder?: number;
      volumeOrder?: number;
      volumeTitle?: string | null;
    } | null;
  } | null;
}

/** 操作验证输入 */
export interface AutoDirectorActionValidationInput {
  source: AutoDirectorValidationSource;
  actionCode: AutoDirectorMutationActionCode;
  task: AutoDirectorActionValidationTaskSnapshot;
}

/** 自动导演跟进区间 */
export const AUTO_DIRECTOR_FOLLOW_UP_SECTIONS = [
  "needs_validation",
  "exception",
  "pending",
  "auto_progress",
  "replaced",
] as const;

/** 自动导演跟进区间类型 */
export type AutoDirectorFollowUpSection = (typeof AUTO_DIRECTOR_FOLLOW_UP_SECTIONS)[number];

/** 跟进区间判定输入 */
export interface AutoDirectorFollowUpSectionInput {
  status: TaskStatus | string;
  checkpointType?: NovelWorkflowCheckpoint | string | null;
  pendingManualRecovery?: boolean | null;
  replacementTaskId?: string | null;
  validationResult?: AutoDirectorValidationResult | null;
}

/** 接管入口步骤排序 */
export const AUTO_DIRECTOR_TAKEOVER_ENTRY_ORDER: Record<DirectorTakeoverEntryStep, number> = {
  basic: 1,
  story_macro: 2,
  character: 3,
  outline: 4,
  structured: 5,
  chapter: 6,
  pipeline: 7,
};

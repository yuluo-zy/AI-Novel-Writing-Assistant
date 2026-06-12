import { z } from "zod";
import { canonicalCharacterResourceSummarySchema } from "./characterResource";

/**
 * == 规范状态（Canonical State）Schema ==
 * 规范状态是故事世界在某一时刻的权威快照，用于保证跨章节的一致性。
 */

/** 风险等级 */
export const canonicalStateRiskLevelSchema = z.enum(["low", "medium", "high"]);
/** 状态变更提案状态 */
export const stateChangeProposalStatusSchema = z.enum(["validated", "pending_review", "committed", "rejected"]);
/** 状态变更提案类型 */
export const stateChangeProposalTypeSchema = z.enum([
  "event_record",
  "character_state_update",
  "relation_state_update",
  "information_disclosure",
  "conflict_update",
  "payoff_progression",
  "character_resource_update",
  "world_rule_change",
  "book_contract_change",
]);

/** 书籍创作约定规范状态 */
export const canonicalBookContractStateSchema = z.object({
  title: z.string(),
  genre: z.string().nullable().optional(),
  targetAudience: z.string().nullable().optional(),
  sellingPoint: z.string().nullable().optional(),
  first30ChapterPromise: z.string().nullable().optional(),
  readingPromise: z.string().nullable().optional(),
  protagonistFantasy: z.string().nullable().optional(),
  coreSellingPoint: z.string().nullable().optional(),
  chapter3Payoff: z.string().nullable().optional(),
  chapter10Payoff: z.string().nullable().optional(),
  chapter30Payoff: z.string().nullable().optional(),
  escalationLadder: z.string().nullable().optional(),
  relationshipMainline: z.string().nullable().optional(),
  toneGuardrails: z.array(z.string()).default([]),
  hardConstraints: z.array(z.string()).default([]),
});

/** 世界观规范状态 */
export const canonicalWorldStateSchema = z.object({
  worldId: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  rules: z.array(z.string()).default([]),
  forces: z.array(z.string()).default([]),
  locations: z.array(z.string()).default([]),
  tabooRules: z.array(z.string()).default([]),
  currentSituation: z.string().nullable().optional(),
});

/** 角色运行时规范状态 */
export const canonicalCharacterRuntimeStateSchema = z.object({
  characterId: z.string(),
  name: z.string(),
  role: z.string(),
  currentGoal: z.string().nullable().optional(),
  currentState: z.string().nullable().optional(),
  currentPressure: z.string().nullable().optional(),
  currentSecret: z.string().nullable().optional(),
  emotion: z.string().nullable().optional(),
  knownFacts: z.array(z.string()).default([]),
  relationStageLabels: z.array(z.string()).default([]),
  resources: z.array(canonicalCharacterResourceSummarySchema).default([]),
  summary: z.string().nullable().optional(),
  lastEventSummary: z.string().nullable().optional(),
});

/** 开放式冲突规范状态 */
export const canonicalOpenConflictStateSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  conflictType: z.string(),
  severity: z.string(),
  status: z.string(),
  resolutionHint: z.string().nullable().optional(),
  lastSeenChapterOrder: z.number().int().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

/** 伏笔规范状态 */
export const canonicalPayoffStateSchema = z.object({
  id: z.string(),
  ledgerKey: z.string(),
  title: z.string(),
  summary: z.string(),
  scopeType: z.string().nullable().optional(),
  currentStatus: z.string(),
  targetStartChapterOrder: z.number().int().nullable().optional(),
  targetEndChapterOrder: z.number().int().nullable().optional(),
  firstSeenChapterOrder: z.number().int().nullable().optional(),
  lastTouchedChapterOrder: z.number().int().nullable().optional(),
  lastTouchedChapterId: z.string().nullable().optional(),
  setupChapterId: z.string().nullable().optional(),
  payoffChapterId: z.string().nullable().optional(),
  statusReason: z.string().nullable().optional(),
  confidence: z.number().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

/** 章节伏笔操作类型 */
export const chapterPayoffDirectiveOperationSchema = z.enum([
  "seed",
  "touch",
  "pressure",
  "partial_reveal",
  "payoff",
  "forbid",
]);

/** 章节伏笔指令 */
export const chapterPayoffDirectiveSchema = z.object({
  title: z.string(),
  ledgerKey: z.string().nullable().optional(),
  operation: chapterPayoffDirectiveOperationSchema,
  reason: z.string(),
  forbiddenReveal: z.string().nullable().optional(),
});

/** 规范时间线事件状态 */
export const canonicalTimelineEventStateSchema = z.object({
  chapterId: z.string().nullable().optional(),
  chapterOrder: z.number().int().nullable().optional(),
  title: z.string(),
  summary: z.string(),
  participants: z.array(z.string()).default([]),
  consequences: z.array(z.string()).default([]),
});

/** 叙事规范状态 */
export const canonicalNarrativeStateSchema = z.object({
  currentVolumeId: z.string().nullable().optional(),
  currentVolumeTitle: z.string().nullable().optional(),
  currentChapterId: z.string().nullable().optional(),
  currentChapterOrder: z.number().int().nullable().optional(),
  currentChapterGoal: z.string().nullable().optional(),
  currentPhase: z.string(),
  openConflicts: z.array(canonicalOpenConflictStateSchema).default([]),
  pendingPayoffs: z.array(canonicalPayoffStateSchema).default([]),
  urgentPayoffs: z.array(canonicalPayoffStateSchema).default([]),
  overduePayoffs: z.array(canonicalPayoffStateSchema).default([]),
  publicKnowledge: z.array(z.string()).default([]),
  hiddenKnowledge: z.array(z.string()).default([]),
  suspenseThreads: z.array(z.string()).default([]),
});

/** 规范状态快照 - 故事世界在某一时刻的完整状态 */
export const canonicalStateSnapshotSchema = z.object({
  novelId: z.string(),
  sourceSnapshotId: z.string().nullable().optional(),
  scopeLabel: z.string(),
  bookContract: canonicalBookContractStateSchema,
  worldState: canonicalWorldStateSchema.nullable(),
  characters: z.array(canonicalCharacterRuntimeStateSchema),
  narrative: canonicalNarrativeStateSchema,
  timeline: z.array(canonicalTimelineEventStateSchema).default([]),
  createdAt: z.string(),
});

/** 状态变更提案 */
export const stateChangeProposalSchema = z.object({
  id: z.string().optional(),
  novelId: z.string(),
  chapterId: z.string().nullable().optional(),
  sourceSnapshotId: z.string().nullable().optional(),
  sourceType: z.string(),
  sourceStage: z.string().nullable().optional(),
  proposalType: stateChangeProposalTypeSchema,
  riskLevel: canonicalStateRiskLevelSchema,
  status: stateChangeProposalStatusSchema.default("validated"),
  summary: z.string(),
  payload: z.record(z.string(), z.unknown()),
  evidence: z.array(z.string()).default([]),
  validationNotes: z.array(z.string()).default([]),
});

/** 状态变更验证结果 */
export const stateChangeValidationResultSchema = z.object({
  accepted: z.array(stateChangeProposalSchema).default([]),
  pendingReview: z.array(stateChangeProposalSchema).default([]),
  rejected: z.array(stateChangeProposalSchema).default([]),
});

/** 状态版本记录 */
export const stateVersionRecordSchema = z.object({
  id: z.string(),
  novelId: z.string(),
  chapterId: z.string().nullable().optional(),
  sourceType: z.string(),
  sourceStage: z.string().nullable().optional(),
  version: z.number().int().positive(),
  summary: z.string(),
  acceptedProposalIds: z.array(z.string()).default([]),
  snapshotJson: z.string(),
  createdAt: z.string(),
});

/** 状态提交结果 */
export const stateCommitResultSchema = z.object({
  versionRecord: stateVersionRecordSchema.nullable(),
  committed: z.array(stateChangeProposalSchema).default([]),
  pendingReview: z.array(stateChangeProposalSchema).default([]),
  rejected: z.array(stateChangeProposalSchema).default([]),
});

/** 生成下一步操作 */
export const generationNextActionSchema = z.enum([
  "replan",
  "refresh_character_state",
  "repair_chapter_mission",
  "advance_payoff",
  "write_chapter",
  "repair_existing_chapter",
  "hold_for_review",
]);

/** 状态目标 */
export const stateGoalSchema = z.object({
  summary: z.string(),
  targetConflicts: z.array(z.string()).default([]),
  targetRelationships: z.array(z.string()).default([]),
  targetPayoffs: z.array(z.string()).default([]),
  targetPayoffDirectives: z.array(chapterPayoffDirectiveSchema).default([]),
  protectedSecrets: z.array(z.string()).default([]),
});

/** 阶段结果预期 */
export const stageOutcomeExpectationSchema = z.object({
  stage: z.string(),
  mustChange: z.array(z.string()).default([]),
  mustNotChange: z.array(z.string()).default([]),
  stateGoal: stateGoalSchema.nullable().optional(),
});

/** 章节状态目标 */
export const chapterStateGoalSchema = stateGoalSchema.extend({
  chapterId: z.string(),
  chapterOrder: z.number().int(),
});

/** 小说控制策略 */
export const novelControlPolicySchema = z.object({
  kickoffMode: z.enum(["manual_start", "director_start", "takeover_start"]),
  advanceMode: z.enum(["manual", "stage_review", "auto_to_ready", "auto_to_execution", "full_book_autopilot"]),
  reviewCheckpoints: z.array(z.string()).default([]),
  autoExecutionRange: z.object({
    mode: z.enum(["book", "volume", "chapter_range"]),
    start: z.number().int().nullable().optional(),
    end: z.number().int().nullable().optional(),
    volumeOrder: z.number().int().nullable().optional(),
  }).nullable().optional(),
});

export type CanonicalStateSnapshot = z.infer<typeof canonicalStateSnapshotSchema>;
export type CanonicalBookContractState = z.infer<typeof canonicalBookContractStateSchema>;
export type CanonicalWorldState = z.infer<typeof canonicalWorldStateSchema>;
export type CanonicalCharacterRuntimeState = z.infer<typeof canonicalCharacterRuntimeStateSchema>;
export type CanonicalOpenConflictState = z.infer<typeof canonicalOpenConflictStateSchema>;
export type CanonicalPayoffState = z.infer<typeof canonicalPayoffStateSchema>;
export type ChapterPayoffDirectiveOperation = z.infer<typeof chapterPayoffDirectiveOperationSchema>;
export type ChapterPayoffDirective = z.infer<typeof chapterPayoffDirectiveSchema>;
export type CanonicalTimelineEventState = z.infer<typeof canonicalTimelineEventStateSchema>;
export type CanonicalNarrativeState = z.infer<typeof canonicalNarrativeStateSchema>;
export type StateChangeProposal = z.infer<typeof stateChangeProposalSchema>;
export type StateChangeValidationResult = z.infer<typeof stateChangeValidationResultSchema>;
export type StateVersionRecord = z.infer<typeof stateVersionRecordSchema>;
export type StateCommitResult = z.infer<typeof stateCommitResultSchema>;
export type GenerationNextAction = z.infer<typeof generationNextActionSchema>;
export type StateGoal = z.infer<typeof stateGoalSchema>;
export type StageOutcomeExpectation = z.infer<typeof stageOutcomeExpectationSchema>;
export type ChapterStateGoal = z.infer<typeof chapterStateGoalSchema>;
export type NovelControlPolicy = z.infer<typeof novelControlPolicySchema>;

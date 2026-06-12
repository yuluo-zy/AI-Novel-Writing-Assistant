import { z } from "zod";

/** 角色资源所有者类型 */
export const characterResourceOwnerTypeSchema = z.enum(["character", "organization", "location", "world", "unknown"]);
/** 角色资源类型 */
export const characterResourceTypeSchema = z.enum([
  "physical_item",
  "clue",
  "credential",
  "ability_resource",
  "relationship_token",
  "consumable",
  "hidden_card",
  "world_resource",
]);
/** 角色资源状态 */
export const characterResourceStatusSchema = z.enum([
  "available",
  "hidden",
  "borrowed",
  "transferred",
  "lost",
  "consumed",
  "damaged",
  "destroyed",
  "stale",
]);
/** 角色资源叙事功能 */
export const characterResourceNarrativeFunctionSchema = z.enum([
  "tool",
  "clue",
  "weapon",
  "proof",
  "key",
  "cost",
  "promise",
  "hidden_card",
  "constraint",
]);
/** 角色资源事件类型 */
export const characterResourceEventTypeSchema = z.enum([
  "introduced",
  "acquired",
  "revealed",
  "used",
  "transferred",
  "lost",
  "consumed",
  "damaged",
  "destroyed",
  "recovered",
  "stale_marked",
]);
/** 角色资源风险等级 */
export const characterResourceRiskLevelSchema = z.enum(["none", "info", "warn", "high"]);
/** 角色资源风险严重程度 */
export const characterResourceRiskSeveritySchema = z.enum(["low", "medium", "high", "critical"]);

/** 角色资源风险信号 */
export const characterResourceRiskSignalSchema = z.object({
  code: z.string(),
  severity: characterResourceRiskSeveritySchema,
  summary: z.string(),
  stale: z.boolean().optional(),
});

/** 角色资源来源引用 */
export const characterResourceSourceRefSchema = z.object({
  kind: z.enum(["chapter_content", "chapter_plan", "state_snapshot", "audit_issue", "payoff_ledger", "manual"]),
  refId: z.string().nullable().optional(),
  refLabel: z.string(),
  chapterId: z.string().nullable().optional(),
  chapterOrder: z.number().int().nullable().optional(),
});

/** 角色资源证据 */
export const characterResourceEvidenceSchema = z.object({
  summary: z.string(),
  chapterId: z.string().nullable().optional(),
  chapterOrder: z.number().int().nullable().optional(),
});

/** 角色资源台账条目 */
export const characterResourceLedgerItemSchema = z.object({
  id: z.string(),
  novelId: z.string(),
  resourceKey: z.string(),
  name: z.string(),
  summary: z.string(),
  resourceType: characterResourceTypeSchema,
  narrativeFunction: characterResourceNarrativeFunctionSchema,
  ownerType: characterResourceOwnerTypeSchema,
  ownerId: z.string().nullable().optional(),
  ownerName: z.string().nullable().optional(),
  ownerCharacterId: z.string().nullable().optional(),
  holderCharacterId: z.string().nullable().optional(),
  holderCharacterName: z.string().nullable().optional(),
  status: characterResourceStatusSchema,
  readerKnows: z.boolean(),
  holderKnows: z.boolean(),
  knownByCharacterIds: z.array(z.string()).default([]),
  introducedChapterId: z.string().nullable().optional(),
  introducedChapterOrder: z.number().int().nullable().optional(),
  lastTouchedChapterId: z.string().nullable().optional(),
  lastTouchedChapterOrder: z.number().int().nullable().optional(),
  expectedUseStartChapterOrder: z.number().int().nullable().optional(),
  expectedUseEndChapterOrder: z.number().int().nullable().optional(),
  constraints: z.array(z.string()).default([]),
  riskSignals: z.array(characterResourceRiskSignalSchema).default([]),
  sourceRefs: z.array(characterResourceSourceRefSchema).default([]),
  evidence: z.array(characterResourceEvidenceSchema).default([]),
  confidence: z.number().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** 角色资源事件 */
export const characterResourceEventSchema = z.object({
  id: z.string(),
  novelId: z.string(),
  resourceId: z.string(),
  chapterId: z.string().nullable().optional(),
  chapterOrder: z.number().int().nullable().optional(),
  eventType: characterResourceEventTypeSchema,
  actorCharacterId: z.string().nullable().optional(),
  fromHolderCharacterId: z.string().nullable().optional(),
  toHolderCharacterId: z.string().nullable().optional(),
  summary: z.string(),
  evidence: z.array(z.string()).default([]),
  createdAt: z.string(),
});

/** 规范化角色资源摘要（用于规范状态快照） */
export const canonicalCharacterResourceSummarySchema = z.object({
  resourceId: z.string(),
  name: z.string(),
  status: characterResourceStatusSchema,
  narrativeFunction: characterResourceNarrativeFunctionSchema,
  summary: z.string(),
  constraints: z.array(z.string()).default([]),
  riskLevel: characterResourceRiskLevelSchema,
});

/** 角色资源上下文（用于章节写作） */
export const characterResourceContextSchema = z.object({
  summary: z.string(),
  availableItems: z.array(characterResourceLedgerItemSchema).default([]),
  setupNeededItems: z.array(characterResourceLedgerItemSchema).default([]),
  blockedItems: z.array(characterResourceLedgerItemSchema).default([]),
  pendingReviewItems: z.array(characterResourceLedgerItemSchema).default([]),
  riskSignals: z.array(characterResourceRiskSignalSchema).default([]),
});

/** 角色资源提案摘要 */
export const characterResourceProposalSummarySchema = z.object({
  id: z.string(),
  novelId: z.string(),
  chapterId: z.string().nullable().optional(),
  sourceType: z.string().optional(),
  sourceStage: z.string().nullable().optional(),
  proposalType: z.literal("character_resource_update"),
  riskLevel: z.enum(["low", "medium", "high"]),
  status: z.enum(["validated", "committed", "pending_review", "rejected"]),
  summary: z.string(),
  payload: z.record(z.string(), z.unknown()).default({}),
  evidence: z.array(z.string()).default([]),
  validationNotes: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** 角色资源台账响应 */
export const characterResourceLedgerResponseSchema = z.object({
  items: z.array(characterResourceLedgerItemSchema).default([]),
  pendingProposals: z.array(characterResourceProposalSummarySchema).default([]),
});

/** 角色资源变更负载 */
export const characterResourceUpdatePayloadSchema = z.object({
  resourceKey: z.string().optional(),
  resourceId: z.string().optional(),
  resourceName: z.string(),
  chapterOrder: z.number().int().nullable().optional(),
  resourceType: characterResourceTypeSchema.default("physical_item"),
  narrativeFunction: characterResourceNarrativeFunctionSchema.default("tool"),
  updateType: characterResourceEventTypeSchema,
  ownerType: characterResourceOwnerTypeSchema.default("unknown"),
  ownerId: z.string().nullable().optional(),
  ownerName: z.string().nullable().optional(),
  holderCharacterId: z.string().nullable().optional(),
  holderCharacterName: z.string().nullable().optional(),
  previousHolderCharacterId: z.string().nullable().optional(),
  statusAfter: characterResourceStatusSchema,
  visibilityAfter: z.object({
    readerKnows: z.boolean(),
    holderKnows: z.boolean(),
    knownByCharacterIds: z.array(z.string()).default([]),
  }),
  summary: z.string().optional(),
  narrativeImpact: z.string(),
  expectedFutureUse: z.string().nullable().optional(),
  expectedUseStartChapterOrder: z.number().int().nullable().optional(),
  expectedUseEndChapterOrder: z.number().int().nullable().optional(),
  constraints: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).nullable().optional(),
});

export type CharacterResourceOwnerType = z.infer<typeof characterResourceOwnerTypeSchema>;
export type CharacterResourceType = z.infer<typeof characterResourceTypeSchema>;
export type CharacterResourceStatus = z.infer<typeof characterResourceStatusSchema>;
export type CharacterResourceNarrativeFunction = z.infer<typeof characterResourceNarrativeFunctionSchema>;
export type CharacterResourceEventType = z.infer<typeof characterResourceEventTypeSchema>;
export type CharacterResourceRiskLevel = z.infer<typeof characterResourceRiskLevelSchema>;
export type CharacterResourceRiskSeverity = z.infer<typeof characterResourceRiskSeveritySchema>;
export type CharacterResourceRiskSignal = z.infer<typeof characterResourceRiskSignalSchema>;
export type CharacterResourceSourceRef = z.infer<typeof characterResourceSourceRefSchema>;
export type CharacterResourceEvidence = z.infer<typeof characterResourceEvidenceSchema>;
export type CharacterResourceLedgerItem = z.infer<typeof characterResourceLedgerItemSchema>;
export type CharacterResourceEvent = z.infer<typeof characterResourceEventSchema>;
export type CanonicalCharacterResourceSummary = z.infer<typeof canonicalCharacterResourceSummarySchema>;
export type CharacterResourceContext = z.infer<typeof characterResourceContextSchema>;
export type CharacterResourceProposalSummary = z.infer<typeof characterResourceProposalSummarySchema>;
export type CharacterResourceLedgerResponse = z.infer<typeof characterResourceLedgerResponseSchema>;
export type CharacterResourceUpdatePayload = z.infer<typeof characterResourceUpdatePayloadSchema>;

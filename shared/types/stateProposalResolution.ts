import { z } from "zod";

/** 导演状态提案决议决策类型 */
export const directorStateProposalResolutionDecisionSchema = z.enum([
  "apply",
  "defer",
  "auto_replan_window",
  "manual_required",
]);

/** 导演状态提案决议 */
export const directorStateProposalResolutionSchema = z.object({
  /** 决议决策 */
  decision: directorStateProposalResolutionDecisionSchema,
  /** 置信度 */
  confidence: z.number().min(0).max(1),
  /** 风险等级 */
  riskLevel: z.enum(["low", "medium", "high"]),
  /** 决策理由 */
  reason: z.string().min(1),
  /** 受影响的章节窗口 */
  affectedChapterWindow: z.object({
    startOrder: z.number().int().nullable().optional(),
    endOrder: z.number().int().nullable().optional(),
    chapterOrders: z.array(z.number().int()).default([]),
  }).default({ chapterOrders: [] }),
  /** 涉及的提案 ID 列表 */
  proposalIds: z.array(z.string()).default([]),
  /** 阻塞的伏笔键列表 */
  blockingLedgerKeys: z.array(z.string()).default([]),
});

/** 导演状态提案决议决策类型 */
export type DirectorStateProposalResolutionDecision = z.infer<typeof directorStateProposalResolutionDecisionSchema>;
/** 导演状态提案决议 */
export type DirectorStateProposalResolution = z.infer<typeof directorStateProposalResolutionSchema>;

import { z } from "zod";

/** 重规划修复意图 */
export const replanRepairIntentSchema = z.enum([
  "patch_repair",
  "state_realign",
  "payoff_rebalance",
  "chapter_rewrite",
  "continue",
]);

/** AI 重规划窗口决策 */
export const aiReplanWindowDecisionSchema = z.object({
  /** 是否推荐重规划 */
  recommended: z.boolean().default(true),
  /** 触发原因 */
  triggerReason: z.string().trim().min(1),
  /** 窗口选择理由 */
  windowReason: z.string().trim().min(1),
  /** 为何选择这些章节 */
  whyTheseChapters: z.string().trim().min(1),
  /** 锚点章节序号 */
  anchorChapterOrder: z.number().int().positive().nullable().optional(),
  /** 受影响的章节序号列表 */
  affectedChapterOrders: z.array(z.number().int().positive()).min(1).max(8),
  /** 阻塞问题 ID 列表 */
  blockingIssueIds: z.array(z.string().trim().min(1)).max(20).default([]),
  /** 阻塞伏笔键列表 */
  blockingLedgerKeys: z.array(z.string().trim().min(1)).max(20).default([]),
  /** 修复意图 */
  repairIntent: replanRepairIntentSchema.default("state_realign"),
  /** 置信度 */
  confidence: z.number().min(0).max(1).default(0.7),
});

/** AI 重规划窗口决策 */
export type AiReplanWindowDecision = z.infer<typeof aiReplanWindowDecisionSchema>;
/** 重规划修复意图 */
export type ReplanRepairIntent = z.infer<typeof replanRepairIntentSchema>;

/** 清洗后的重规划窗口决策 */
export interface SanitizedReplanWindowDecision extends AiReplanWindowDecision {
  /** 锚点章节序号（已校验） */
  anchorChapterOrder: number | null;
  /** 受影响的章节序号列表（已去重排序截断） */
  affectedChapterOrders: number[];
}

function uniqueNumbers(items: number[]): number[] {
  return Array.from(new Set(
    items
      .filter((item) => Number.isInteger(item) && item > 0)
      .map((item) => Number(item)),
  )).sort((left, right) => left - right);
}

function nearestAvailableOrder(value: number | null | undefined, availableChapterOrders: number[]): number | null {
  if (!value || availableChapterOrders.length === 0) {
    return null;
  }
  let best = availableChapterOrders[0];
  let bestDistance = Math.abs(best - value);
  for (const order of availableChapterOrders) {
    const distance = Math.abs(order - value);
    if (distance < bestDistance) {
      best = order;
      bestDistance = distance;
    }
  }
  return best;
}

/** 清洗 AI 重规划窗口决策，确保结果可用 */
export function sanitizeAiReplanWindowDecision(input: {
  decision: AiReplanWindowDecision;
  availableChapterOrders: number[];
  targetChapterOrder: number;
  maxWindowSize?: number;
}): SanitizedReplanWindowDecision {
  const available = uniqueNumbers(input.availableChapterOrders);
  const availableSet = new Set(available);
  const maxWindowSize = Math.max(1, Math.min(input.maxWindowSize ?? 5, 5));
  const filteredOrders = uniqueNumbers(input.decision.affectedChapterOrders)
    .filter((order) => availableSet.has(order))
    .slice(0, maxWindowSize);
  if (filteredOrders.length === 0) {
    throw new Error("AI replan window did not select any available chapter.");
  }
  const anchorChapterOrder = availableSet.has(input.decision.anchorChapterOrder ?? 0)
    ? input.decision.anchorChapterOrder ?? null
    : nearestAvailableOrder(input.decision.anchorChapterOrder ?? input.targetChapterOrder, available);
  return {
    ...input.decision,
    anchorChapterOrder,
    affectedChapterOrders: filteredOrders,
    blockingIssueIds: Array.from(new Set(input.decision.blockingIssueIds)),
    blockingLedgerKeys: Array.from(new Set(input.decision.blockingLedgerKeys)),
  };
}

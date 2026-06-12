import { z } from "zod";

/** 章节补丁修复策略 */
export const CHAPTER_PATCH_REPAIR_STRATEGIES = [
  "patch_first",
  "full_rewrite",
] as const;

export type ChapterPatchRepairStrategy = typeof CHAPTER_PATCH_REPAIR_STRATEGIES[number];

/** 章节补丁操作 schema - 定义一次局部替换 */
export const chapterPatchOperationSchema = z.object({
  id: z.string().trim().min(1),
  /** 目标原文摘录（至少 6 字符以确保唯一匹配） */
  targetExcerpt: z.string().trim().min(6),
  /** 替换文本 */
  replacement: z.string().trim(),
  /** 替换原因 */
  reason: z.string().trim().min(1),
  /** 关联问题 ID 列表 */
  issueIds: z.array(z.string().trim().min(1)).max(8).default([]),
});

/** 章节补丁修复计划 */
export const chapterPatchRepairPlanSchema = z.object({
  /** 修复策略 */
  strategy: z.enum(CHAPTER_PATCH_REPAIR_STRATEGIES).default("patch_first"),
  /** 修复计划摘要 */
  summary: z.string().trim().min(1),
  /** 补丁操作列表（最多 8 个） */
  patches: z.array(chapterPatchOperationSchema).max(8).default([]),
  /** 是否需要全章重写 */
  requiresFullRewrite: z.boolean().default(false),
  /** 升级到重写的原因 */
  escalationReason: z.string().trim().nullable().optional(),
});

export type ChapterPatchOperation = z.infer<typeof chapterPatchOperationSchema>;
export type ChapterPatchRepairPlan = z.infer<typeof chapterPatchRepairPlanSchema>;

/** 补丁应用失败类型 */
export type ChapterPatchApplyFailureType =
  | "requires_full_rewrite"
  | "missing_target"
  | "ambiguous_target"
  | "no_effect";

/** 补丁匹配策略 */
export type ChapterPatchMatchStrategy = "exact" | "normalized_whitespace";

/** 补丁应用失败详情 */
export interface ChapterPatchApplyFailure {
  /** 补丁 ID */
  patchId: string;
  /** 失败原因 */
  reason: string;
  /** 失败类型 */
  failureType: ChapterPatchApplyFailureType;
  /** 使用的匹配策略 */
  matchedBy?: ChapterPatchMatchStrategy;
  /** 出现次数 */
  occurrenceCount?: number;
}

/** 已应用的补丁信息 */
export interface ChapterPatchAppliedPatch {
  patchId: string;
  matchedBy: ChapterPatchMatchStrategy;
}

/** 补丁应用结果 */
export interface ChapterPatchApplyResult {
  /** 是否完全成功 */
  success: boolean;
  /** 修复后的内容 */
  content: string;
  /** 已应用的补丁 ID 列表 */
  appliedPatchIds: string[];
  /** 已应用的补丁详情列表 */
  appliedPatches: ChapterPatchAppliedPatch[];
  /** 失败的补丁列表 */
  failures: ChapterPatchApplyFailure[];
}

function countOccurrences(content: string, target: string): number {
  if (target.length === 0) {
    return 0;
  }
  let count = 0;
  let cursor = 0;
  while (cursor < content.length) {
    const index = content.indexOf(target, cursor);
    if (index < 0) {
      break;
    }
    count += 1;
    cursor = index + target.length;
  }
  return count;
}

interface PatchMatch {
  start: number;
  end: number;
  matchedBy: ChapterPatchMatchStrategy;
}

function buildWhitespaceNormalizedIndex(value: string): {
  text: string;
  originalIndices: number[];
} {
  const chars: string[] = [];
  const originalIndices: number[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]!;
    if (/\s/u.test(char)) {
      continue;
    }
    chars.push(char);
    originalIndices.push(index);
  }
  return {
    text: chars.join(""),
    originalIndices,
  };
}

function findWhitespaceNormalizedMatches(content: string, target: string): PatchMatch[] {
  const normalizedContent = buildWhitespaceNormalizedIndex(content);
  const normalizedTarget = buildWhitespaceNormalizedIndex(target);
  if (!normalizedTarget.text) {
    return [];
  }

  const matches: PatchMatch[] = [];
  let cursor = 0;
  while (cursor < normalizedContent.text.length) {
    const normalizedIndex = normalizedContent.text.indexOf(normalizedTarget.text, cursor);
    if (normalizedIndex < 0) {
      break;
    }
    const lastNormalizedIndex = normalizedIndex + normalizedTarget.text.length - 1;
    const start = normalizedContent.originalIndices[normalizedIndex];
    const endSourceIndex = normalizedContent.originalIndices[lastNormalizedIndex];
    if (typeof start === "number" && typeof endSourceIndex === "number") {
      matches.push({
        start,
        end: endSourceIndex + 1,
        matchedBy: "normalized_whitespace",
      });
    }
    cursor = normalizedIndex + normalizedTarget.text.length;
  }
  return matches;
}

function findSafePatchMatch(content: string, target: string): {
  match: PatchMatch | null;
  occurrenceCount: number;
  matchedBy?: ChapterPatchMatchStrategy;
} {
  const exactCount = countOccurrences(content, target);
  if (exactCount === 1) {
    const start = content.indexOf(target);
    return {
      match: {
        start,
        end: start + target.length,
        matchedBy: "exact",
      },
      occurrenceCount: exactCount,
      matchedBy: "exact",
    };
  }
  if (exactCount > 1) {
    return {
      match: null,
      occurrenceCount: exactCount,
      matchedBy: "exact",
    };
  }

  const normalizedMatches = findWhitespaceNormalizedMatches(content, target);
  if (normalizedMatches.length === 1) {
    return {
      match: normalizedMatches[0]!,
      occurrenceCount: normalizedMatches.length,
      matchedBy: "normalized_whitespace",
    };
  }
  return {
    match: null,
    occurrenceCount: normalizedMatches.length,
    matchedBy: normalizedMatches.length > 0 ? "normalized_whitespace" : undefined,
  };
}

/**
 * 应用章节补丁修复计划到原文
 * 先尝试精确匹配，再尝试忽略空白符的模糊匹配
 */
export function applyChapterPatchRepairPlan(
  content: string,
  plan: ChapterPatchRepairPlan,
): ChapterPatchApplyResult {
  const normalizedPlan = chapterPatchRepairPlanSchema.parse(plan);
  let nextContent = content;
  const appliedPatchIds: string[] = [];
  const appliedPatches: ChapterPatchAppliedPatch[] = [];
  const failures: ChapterPatchApplyFailure[] = [];

  if (normalizedPlan.strategy !== "patch_first" || normalizedPlan.requiresFullRewrite) {
    return {
      success: false,
      content,
      appliedPatchIds,
      appliedPatches,
      failures: [{
        patchId: "plan",
        reason: normalizedPlan.escalationReason?.trim() || "补丁计划要求整章重写。",
        failureType: "requires_full_rewrite",
      }],
    };
  }

  for (const patch of normalizedPlan.patches) {
    const target = patch.targetExcerpt.trim();
    const replacement = patch.replacement.trim();
    const matchResult = findSafePatchMatch(nextContent, target);
    if (!matchResult.match) {
      failures.push({
        patchId: patch.id,
        reason: matchResult.occurrenceCount === 0
          ? "目标片段不存在，不能安全应用局部补丁。"
          : "目标片段出现多次，不能确定局部补丁位置。",
        failureType: matchResult.occurrenceCount === 0 ? "missing_target" : "ambiguous_target",
        matchedBy: matchResult.matchedBy,
        occurrenceCount: matchResult.occurrenceCount,
      });
      continue;
    }

    const beforePatch = nextContent;
    nextContent = [
      nextContent.slice(0, matchResult.match.start),
      replacement,
      nextContent.slice(matchResult.match.end),
    ].join("");
    if (nextContent === beforePatch) {
      failures.push({
        patchId: patch.id,
        reason: "局部补丁没有产生有效正文变化。",
        failureType: "no_effect",
        matchedBy: matchResult.match.matchedBy,
        occurrenceCount: matchResult.occurrenceCount,
      });
      continue;
    }
    appliedPatchIds.push(patch.id);
    appliedPatches.push({
      patchId: patch.id,
      matchedBy: matchResult.match.matchedBy,
    });
  }

  const changed = nextContent.trim() !== content.trim();
  return {
    success: failures.length === 0 && appliedPatchIds.length > 0 && changed,
    content: nextContent,
    appliedPatchIds,
    appliedPatches,
    failures,
  };
}

import type { LLMProvider } from "./llm";

/** 最大商业标签数 */
export const BOOK_FRAMING_MAX_COMMERCIAL_TAGS = 6;
/** 商业标签最大长度 */
export const BOOK_FRAMING_COMMERCIAL_TAG_MAX_LENGTH = 20;

/** 书籍定位建议 */
export interface BookFramingSuggestion {
  /** 目标读者 */
  targetAudience: string;
  /** 商业标签 */
  commercialTags: string[];
  /** 竞品气质 */
  competingFeel: string;
  /** 卖点 */
  bookSellingPoint: string;
  /** 前 30 章承诺 */
  first30ChapterPromise: string;
}

/** 书籍定位建议输入 */
export interface BookFramingSuggestionInput {
  /** 书名 */
  title?: string;
  /** 简介 */
  description?: string;
  /** 题材标签 */
  genreLabel?: string;
  /** 风格调性 */
  styleTone?: string;
  /** LLM 提供商 */
  provider?: LLMProvider;
  /** 模型名称 */
  model?: string;
  /** 温度 */
  temperature?: number;
}

function normalizeSingleCommercialTag(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, BOOK_FRAMING_COMMERCIAL_TAG_MAX_LENGTH);
}

/** 规范化商业标签输入（去重、截断、限制数量） */
export function normalizeCommercialTags(input: string | string[] | null | undefined): string[] {
  const rawValues = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(/[\n,，]/)
      : [];
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const item of rawValues) {
    if (typeof item !== "string") {
      continue;
    }
    const next = normalizeSingleCommercialTag(item);
    if (!next || seen.has(next)) {
      continue;
    }
    seen.add(next);
    normalized.push(next);
    if (normalized.length >= BOOK_FRAMING_MAX_COMMERCIAL_TAGS) {
      break;
    }
  }
  return normalized;
}

/** 解析 JSON 串为商业标签数组 */
export function parseCommercialTagsJson(raw: string | null | undefined): string[] {
  if (!raw?.trim()) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    return normalizeCommercialTags(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

/** 序列化商业标签数组为 JSON 串 */
export function serializeCommercialTagsJson(input: string | string[] | null | undefined): string | null {
  const tags = normalizeCommercialTags(input);
  return tags.length > 0 ? JSON.stringify(tags) : null;
}

/** 格式化商业标签为可读字符串 */
export function formatCommercialTagsInput(input: string | string[] | null | undefined): string {
  return normalizeCommercialTags(input).join("，");
}

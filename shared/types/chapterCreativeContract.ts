/**
 * 系统审计标记列表，用于过滤不应作为创作承诺的审计项。
 * 这些标记来自系统内部的质量检查，不应被当作"必须推进"的创作条款。
 */
const SYSTEM_AUDIT_MARKERS = [
  "acceptance_gate_unavailable",
  "missing_must_hit",
  "quality_gate_failed",
  "schema_error",
  "mode_fit",
  "plot/missing_must_hit",
  "mode_fit/acceptance_gate_unavailable",
];

function normalizeContractMarker(value: string): string {
  return value
    .replace(/\s+/g, "")
    .replace(/[：:]/g, "/")
    .trim()
    .toLowerCase();
}

/** 判断一个值是否为系统审计合同项 */
export function isSystemAuditContractItem(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }
  const normalized = normalizeContractMarker(value);
  if (!normalized) {
    return false;
  }
  return SYSTEM_AUDIT_MARKERS.some((marker) => normalized.includes(marker));
}

/**
 * 清洗创作必须推进项列表
 * - 去除空串和纯空白项
 * - 去除系统审计标记项
 * - 去重
 */
export function sanitizeCreativeMustAdvanceItems(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const normalized = item.trim();
    if (!normalized || isSystemAuditContractItem(normalized) || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

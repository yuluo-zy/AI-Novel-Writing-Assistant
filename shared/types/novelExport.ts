/** 小说导出范围可选值 */
export const NOVEL_EXPORT_SCOPE_VALUES = [
  "full",
  "basic",
  "story_macro",
  "character",
  "outline",
  "structured",
  "chapter",
  "pipeline",
] as const;

/** 小说导出格式可选值 */
export const NOVEL_EXPORT_FORMAT_VALUES = ["txt", "markdown", "json"] as const;

/** 小说导出下载格式可选值 */
export const NOVEL_EXPORT_DOWNLOAD_FORMAT_VALUES = ["markdown", "json"] as const;

/** 小说导出范围 */
export type NovelExportScope = (typeof NOVEL_EXPORT_SCOPE_VALUES)[number];
/** 小说导出格式 */
export type NovelExportFormat = (typeof NOVEL_EXPORT_FORMAT_VALUES)[number];
/** 小说导出下载格式 */
export type NovelExportDownloadFormat = (typeof NOVEL_EXPORT_DOWNLOAD_FORMAT_VALUES)[number];

/** 导出范围的中文标签映射 */
export const NOVEL_EXPORT_SCOPE_LABELS: Record<NovelExportScope, string> = {
  full: "整本书",
  basic: "项目设定",
  story_macro: "故事宏观规划",
  character: "角色准备",
  outline: "卷战略 / 卷骨架",
  structured: "节奏 / 拆章",
  chapter: "章节执行",
  pipeline: "质量修复",
};

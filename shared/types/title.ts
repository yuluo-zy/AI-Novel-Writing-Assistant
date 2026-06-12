/** 标题工厂模式 */
export type TitleFactoryMode = "brief" | "adapt";
/** 标题建议风格 */
export type TitleSuggestionStyle = "literary" | "conflict" | "suspense" | "high_concept";

/** 标题工厂建议 */
export interface TitleFactorySuggestion {
  /** 标题文本 */
  title: string;
  /** 预期点击率 */
  clickRate: number;
  /** 标题风格 */
  style: TitleSuggestionStyle;
  /** 切入角度 */
  angle?: string | null;
  /** 推荐理由 */
  reason?: string | null;
}

/** 标题库条目 */
export interface TitleLibraryEntry {
  id: string;
  /** 标题文本 */
  title: string;
  /** 描述 */
  description?: string | null;
  /** 点击率 */
  clickRate?: number | null;
  /** 关键词 */
  keywords?: string | null;
  /** 题材 ID */
  genreId?: string | null;
  /** 使用次数 */
  usedCount: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 关联题材信息 */
  genre?: {
    id: string;
    name: string;
  } | null;
}

/** 标题库列表查询结果 */
export interface TitleLibraryListResult {
  items: TitleLibraryEntry[];
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 总记录数 */
  total: number;
  /** 总页数 */
  totalPages: number;
}

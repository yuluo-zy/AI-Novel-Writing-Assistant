/** 小说资源推荐选项 */
export interface NovelResourceRecommendationOption {
  id: string;
  /** 选项名称 */
  name: string;
  /** 路径 */
  path: string;
  /** 推荐理由 */
  reason: string;
}

/** 小说创建时的资源推荐 */
export interface NovelCreateResourceRecommendation {
  /** 推荐摘要 */
  summary: string;
  /** 推荐题材 */
  genre: NovelResourceRecommendationOption;
  /** 推荐主故事模式 */
  primaryStoryMode: NovelResourceRecommendationOption;
  /** 推荐副故事模式 */
  secondaryStoryMode?: NovelResourceRecommendationOption | null;
  /** 提醒事项 */
  caution?: string | null;
  /** 推荐时间 */
  recommendedAt: string;
}

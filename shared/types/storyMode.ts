/** 故事模式冲突上限 */
export type StoryModeConflictCeiling = "low" | "medium" | "high";

/** 故事模式配置描述 */
export interface StoryModeProfile {
  /** 核心驱动力 */
  coreDrive: string;
  /** 读者期待回报 */
  readerReward: string;
  /** 推进单位 */
  progressionUnits: string[];
  /** 允许的冲突形式 */
  allowedConflictForms: string[];
  /** 禁止的冲突形式 */
  forbiddenConflictForms: string[];
  /** 冲突上限 */
  conflictCeiling: StoryModeConflictCeiling;
  /** 解决风格 */
  resolutionStyle: string;
  /** 章节单元 */
  chapterUnit: string;
  /** 卷奖励 */
  volumeReward: string;
  /** 必须信号 */
  mandatorySignals: string[];
  /** 反信号（不应出现的内容） */
  antiSignals: string[];
}

/** 小说故事模式 */
export interface NovelStoryMode {
  id: string;
  /** 模式名称 */
  name: string;
  /** 描述 */
  description?: string | null;
  /** 模板 */
  template?: string | null;
  /** 父模式 ID */
  parentId?: string | null;
  /** 模式配置详情 */
  profile: StoryModeProfile;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

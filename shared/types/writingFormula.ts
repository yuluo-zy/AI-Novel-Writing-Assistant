/** 写作公式接口 */
export interface WritingFormula {
  id: string;
  /** 公式名称 */
  name: string;
  /** 来源文本 */
  sourceText?: string | null;
  /** 公式内容 */
  content?: string | null;
  /** 适用题材 */
  genre?: string | null;
  /** 适用风格 */
  style?: string | null;
  /** 调性 / 语气 */
  toneVoice?: string | null;
  /** 结构特征 */
  structure?: string | null;
  /** 节奏特征 */
  pacing?: string | null;
  /** 段落模式 */
  paragraphPattern?: string | null;
  /** 句式结构 */
  sentenceStructure?: string | null;
  /** 词汇层级 */
  vocabularyLevel?: string | null;
  /** 修辞手法 */
  rhetoricalDevices?: string | null;
  /** 叙事模式 */
  narrativeMode?: string | null;
  /** 视角 */
  perspectivePoint?: string | null;
  /** 角色声线 */
  characterVoice?: string | null;
  /** 主题 */
  themes?: string | null;
  /** 母题 */
  motifs?: string | null;
  /** 情绪基调 */
  emotionalTone?: string | null;
  /** 独特特征 */
  uniqueFeatures?: string | null;
  /** 公式描述 */
  formulaDescription?: string | null;
  /** 公式步骤 */
  formulaSteps?: string | null;
  /** 应用提示 */
  applicationTips?: string | null;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

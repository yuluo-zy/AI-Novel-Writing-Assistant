import type { LLMProvider } from "./llm";

/** 角色演绎角色类型 */
export type CharacterCastRole =
  | "protagonist"
  | "antagonist"
  | "ally"
  | "foil"
  | "mentor"
  | "love_interest"
  | "pressure_source"
  | "catalyst";

/** 角色性别 */
export type CharacterGender = "male" | "female" | "other" | "unknown";

/** 角色核心事实信息（运行时硬事实） */
export interface CharacterHardFacts {
  identityLabel?: string | null;
  factionLabel?: string | null;
  stanceLabel?: string | null;
  powerLevel?: string | null;
  realm?: string | null;
  currentLocation?: string | null;
  availability?: string | null;
  prohibitions?: string[] | null;
  prohibitionsJson?: string | null;
}

/** 小说角色 */
export interface Character {
  id: string;
  /** 角色名称 */
  name: string;
  /** 角色 */
  role: string;
  /** 性别 */
  gender?: CharacterGender | null;
  /** 演绎角色 */
  castRole?: CharacterCastRole | null;
  /** 故事功能 */
  storyFunction?: string | null;
  /** 与主角关系 */
  relationToProtagonist?: string | null;
  /** 性格 */
  personality?: string | null;
  /** 背景 */
  background?: string | null;
  /** 成长弧 */
  development?: string | null;
  identityLabel?: string | null;
  factionLabel?: string | null;
  stanceLabel?: string | null;
  powerLevel?: string | null;
  realm?: string | null;
  currentLocation?: string | null;
  availability?: string | null;
  prohibitions?: string[] | null;
  prohibitionsJson?: string | null;
  /** 外在目标 */
  outerGoal?: string | null;
  /** 内在需求 */
  innerNeed?: string | null;
  /** 恐惧 */
  fear?: string | null;
  /** 创伤 */
  wound?: string | null;
  /** 错误信念 */
  misbelief?: string | null;
  /** 秘密 */
  secret?: string | null;
  /** 道德底线 */
  moralLine?: string | null;
  /** 第一印象 */
  firstImpression?: string | null;
  /** 外貌 */
  appearance?: string | null;
  /** 体格 */
  physique?: string | null;
  /** 着装风格 */
  attireStyle?: string | null;
  /** 标志性细节 */
  signatureDetail?: string | null;
  /** 声线 */
  voiceTexture?: string | null;
  /** 存在感印象 */
  presenceImpression?: string | null;
  /** 弧线起点 */
  arcStart?: string | null;
  /** 弧线中点 */
  arcMidpoint?: string | null;
  /** 弧线高潮 */
  arcClimax?: string | null;
  /** 弧线终点 */
  arcEnd?: string | null;
  /** 当前状态 */
  currentState?: string | null;
  /** 当前目标 */
  currentGoal?: string | null;
  /** 最后进化时间 */
  lastEvolvedAt?: string | null;
  /** 所属小说 ID */
  novelId: string;
  /** 基础角色 ID */
  baseCharacterId?: string | null;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 角色可见形象字段 */
export type CharacterVisibleProfileField =
  | "appearance"
  | "physique"
  | "attireStyle"
  | "signatureDetail"
  | "voiceTexture"
  | "presenceImpression";

export type CharacterVisibleProfileFields = Partial<Record<CharacterVisibleProfileField, string | null>>;

/** 角色可见形象建议 */
export interface CharacterVisibleProfileSuggestion {
  characterId: string;
  characterName: string;
  fields: CharacterVisibleProfileFields;
  skippedFields: Partial<Record<CharacterVisibleProfileField, string>>;
  confidence: number;
  warnings: string[];
  hasApplicableChanges: boolean;
  allowsOverwriteExisting?: boolean;
}

/** 角色可见形象批量结果 */
export interface CharacterVisibleProfileBatchResult {
  novelId: string;
  results: CharacterVisibleProfileSuggestion[];
  skippedCharacters: Array<{
    characterId: string;
    characterName: string;
    reason: string;
  }>;
}

/** 角色可见形象应用结果 */
export interface CharacterVisibleProfileApplyResult {
  character: Character;
  appliedFields: CharacterVisibleProfileField[];
  skippedFields: Partial<Record<CharacterVisibleProfileField, string>>;
  warnings: string[];
}

/** 基础角色（角色库） */
export interface BaseCharacter {
  id: string;
  name: string;
  role: string;
  personality: string;
  background: string;
  development: string;
  appearance?: string | null;
  weaknesses?: string | null;
  interests?: string | null;
  keyEvents?: string | null;
  tags: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

/** 角色关系 */
export interface CharacterRelation {
  id: string;
  novelId: string;
  sourceCharacterId: string;
  targetCharacterId: string;
  sourceCharacterName?: string | null;
  targetCharacterName?: string | null;
  surfaceRelation: string;
  hiddenTension?: string | null;
  conflictSource?: string | null;
  secretAsymmetry?: string | null;
  dynamicLabel?: string | null;
  nextTurnPoint?: string | null;
  trustScore?: number | null;
  conflictScore?: number | null;
  intimacyScore?: number | null;
  dependencyScore?: number | null;
  evidence?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 角色阵容选项成员 */
export interface CharacterCastOptionMember {
  id: string;
  optionId: string;
  sortOrder: number;
  name: string;
  role: string;
  gender: CharacterGender;
  castRole: CharacterCastRole;
  relationToProtagonist?: string | null;
  storyFunction: string;
  shortDescription?: string | null;
  personality?: string | null;
  background?: string | null;
  development?: string | null;
  identityLabel?: string | null;
  factionLabel?: string | null;
  stanceLabel?: string | null;
  powerLevel?: string | null;
  realm?: string | null;
  currentLocation?: string | null;
  availability?: string | null;
  prohibitions?: string[] | null;
  prohibitionsJson?: string | null;
  outerGoal?: string | null;
  innerNeed?: string | null;
  fear?: string | null;
  wound?: string | null;
  misbelief?: string | null;
  secret?: string | null;
  moralLine?: string | null;
  firstImpression?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 角色阵容选项关系 */
export interface CharacterCastOptionRelation {
  id: string;
  optionId: string;
  sortOrder: number;
  sourceName: string;
  targetName: string;
  surfaceRelation: string;
  hiddenTension?: string | null;
  conflictSource?: string | null;
  secretAsymmetry?: string | null;
  dynamicLabel?: string | null;
  nextTurnPoint?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 角色阵容质量问题编码 */
export type CharacterCastQualityIssueCode =
  | "abstract_name"
  | "english_residue"
  | "duplicate_story_function"
  | "missing_protagonist"
  | "missing_current_identity_anchor"
  | "missing_hidden_identity_anchor"
  | "missing_gender";

/** 角色阵容质量问题 */
export interface CharacterCastQualityIssue {
  code: CharacterCastQualityIssueCode;
  optionIndex?: number;
  optionTitle: string;
  message: string;
  memberName?: string;
}

/** 角色阵容质量评估 */
export interface CharacterCastQualityAssessment {
  autoApplicable: boolean;
  blockingReasons: string[];
  issues: CharacterCastQualityIssue[];
}

/** 角色阵容选项 */
export interface CharacterCastOption {
  id: string;
  novelId: string;
  title: string;
  summary: string;
  whyItWorks?: string | null;
  recommendedReason?: string | null;
  status: string;
  sourceStoryInput?: string | null;
  qualityAssessment?: CharacterCastQualityAssessment | null;
  members: CharacterCastOptionMember[];
  relations: CharacterCastOptionRelation[];
  createdAt: string;
  updatedAt: string;
}

/** 角色阵容应用结果 */
export interface CharacterCastApplyResult {
  optionId: string;
  createdCount: number;
  updatedCount: number;
  relationCount: number;
  characterIds: string[];
  primaryCharacterId?: string | null;
  qualityOverrideApplied?: boolean;
  qualityWarnings?: string[];
}

export interface CharacterCastOptionDeleteResult {
  deletedOptionId: string;
  deletedAppliedOption: boolean;
  remainingOptionCount: number;
}

export interface CharacterCastOptionClearResult {
  deletedCount: number;
  deletedAppliedCount: number;
  remainingOptionCount: number;
}

export type SupplementalCharacterGenerationMode = "linked" | "independent" | "auto";
export type SupplementalCharacterTargetCastRole = CharacterCastRole | "auto";

export interface CharacterWorldFocusHints {
  preferFaction?: string;
  forceCompliance?: boolean;
}

export interface SupplementalCharacterGenerateInput {
  mode?: SupplementalCharacterGenerationMode;
  anchorCharacterIds?: string[];
  targetCastRole?: SupplementalCharacterTargetCastRole;
  count?: number;
  userPrompt?: string;
  useWorldContext?: boolean;
  worldFocusHints?: CharacterWorldFocusHints;
  provider?: LLMProvider;
  model?: string;
  temperature?: number;
}

export interface SupplementalCharacterRelation {
  sourceName: string;
  targetName: string;
  surfaceRelation: string;
  hiddenTension?: string | null;
  conflictSource?: string | null;
  dynamicLabel?: string | null;
  nextTurnPoint?: string | null;
}

export interface SupplementalCharacterCandidate {
  name: string;
  role: string;
  gender: CharacterGender;
  castRole: CharacterCastRole;
  summary: string;
  storyFunction: string;
  relationToProtagonist?: string | null;
  personality?: string | null;
  background?: string | null;
  development?: string | null;
  identityLabel?: string | null;
  factionLabel?: string | null;
  stanceLabel?: string | null;
  powerLevel?: string | null;
  realm?: string | null;
  currentLocation?: string | null;
  availability?: string | null;
  prohibitions?: string[] | null;
  prohibitionsJson?: string | null;
  outerGoal?: string | null;
  innerNeed?: string | null;
  fear?: string | null;
  wound?: string | null;
  misbelief?: string | null;
  secret?: string | null;
  moralLine?: string | null;
  firstImpression?: string | null;
  currentState?: string | null;
  currentGoal?: string | null;
  whyNow?: string | null;
  relations: SupplementalCharacterRelation[];
}

export interface SupplementalCharacterGenerationResult {
  mode: SupplementalCharacterGenerationMode;
  recommendedCount: number;
  planningSummary?: string | null;
  candidates: SupplementalCharacterCandidate[];
}

export interface SupplementalCharacterApplyResult {
  character: Character;
  relationCount: number;
}

export interface CharacterTimeline {
  id: string;
  novelId: string;
  characterId: string;
  chapterId?: string | null;
  chapterOrder?: number | null;
  title: string;
  content: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

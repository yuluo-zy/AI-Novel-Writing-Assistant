/** 角色候选状态 */
export type CharacterCandidateStatus = "pending" | "confirmed" | "merged" | "rejected";
/** 动态角色风险等级 */
export type DynamicCharacterRiskLevel = "none" | "info" | "warn" | "high";

/** 角色候选 */
export interface CharacterCandidate {
  id: string;
  /** 所属小说 ID */
  novelId: string;
  /** 来源章节 ID */
  sourceChapterId?: string | null;
  /** 来源章节序号 */
  sourceChapterOrder?: number | null;
  /** 建议名称 */
  proposedName: string;
  /** 建议角色 */
  proposedRole?: string | null;
  /** 摘要 */
  summary?: string | null;
  /** 依据证据 */
  evidence: string[];
  /** 匹配到的现有角色 ID */
  matchedCharacterId?: string | null;
  /** 状态 */
  status: CharacterCandidateStatus;
  /** 置信度 */
  confidence?: number | null;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 角色卷分配 */
export interface CharacterVolumeAssignment {
  id: string;
  /** 所属小说 ID */
  novelId: string;
  /** 角色 ID */
  characterId: string;
  /** 卷 ID */
  volumeId: string;
  /** 卷标题 */
  volumeTitle?: string | null;
  /** 角色标签 */
  roleLabel?: string | null;
  /** 职责 */
  responsibility: string;
  /** 出场预期 */
  appearanceExpectation?: string | null;
  /** 规划出场章节序号列表 */
  plannedChapterOrders: number[];
  /** 是否为核心角色 */
  isCore: boolean;
  /** 缺席警告阈值 */
  absenceWarningThreshold: number;
  /** 缺席高风险阈值 */
  absenceHighRiskThreshold: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 角色阵营追踪 */
export interface CharacterFactionTrack {
  id: string;
  /** 所属小说 ID */
  novelId: string;
  /** 角色 ID */
  characterId: string;
  /** 卷 ID */
  volumeId?: string | null;
  /** 卷标题 */
  volumeTitle?: string | null;
  /** 章节 ID */
  chapterId?: string | null;
  /** 章节序号 */
  chapterOrder?: number | null;
  /** 阵营标签 */
  factionLabel: string;
  /** 立场标签 */
  stanceLabel?: string | null;
  /** 摘要 */
  summary?: string | null;
  /** 来源类型 */
  sourceType: string;
  /** 置信度 */
  confidence?: number | null;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 角色关系阶段 */
export interface CharacterRelationStage {
  id: string;
  /** 所属小说 ID */
  novelId: string;
  /** 关系 ID */
  relationId?: string | null;
  /** 源角色 ID */
  sourceCharacterId: string;
  /** 目标角色 ID */
  targetCharacterId: string;
  /** 源角色名称 */
  sourceCharacterName?: string | null;
  /** 目标角色名称 */
  targetCharacterName?: string | null;
  /** 卷 ID */
  volumeId?: string | null;
  /** 卷标题 */
  volumeTitle?: string | null;
  /** 章节 ID */
  chapterId?: string | null;
  /** 章节序号 */
  chapterOrder?: number | null;
  /** 阶段标签 */
  stageLabel: string;
  /** 阶段摘要 */
  stageSummary: string;
  /** 下一个转折点 */
  nextTurnPoint?: string | null;
  /** 来源类型 */
  sourceType: string;
  /** 置信度 */
  confidence?: number | null;
  /** 是否为当前阶段 */
  isCurrent: boolean;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 动态角色总览条目 */
export interface DynamicCharacterOverviewItem {
  /** 角色 ID */
  characterId: string;
  /** 角色名称 */
  name: string;
  /** 角色 */
  role: string;
  /** 演绎角色 */
  castRole?: string | null;
  /** 当前状态 */
  currentState?: string | null;
  /** 当前目标 */
  currentGoal?: string | null;
  /** 卷角色标签 */
  volumeRoleLabel?: string | null;
  /** 卷职责 */
  volumeResponsibility?: string | null;
  /** 是否为卷核心 */
  isCoreInVolume: boolean;
  /** 规划出场章节序号 */
  plannedChapterOrders: number[];
  /** 出场次数 */
  appearanceCount: number;
  /** 最后出场章节序号 */
  lastAppearanceChapterOrder?: number | null;
  /** 缺席跨度 */
  absenceSpan: number;
  /** 缺席风险等级 */
  absenceRisk: DynamicCharacterRiskLevel;
  /** 阵营标签 */
  factionLabel?: string | null;
  /** 立场标签 */
  stanceLabel?: string | null;
}

/** 动态角色当前卷信息 */
export interface DynamicCharacterCurrentVolume {
  id?: string | null;
  /** 卷标题 */
  title: string;
  /** 排序序号 */
  sortOrder?: number | null;
  /** 起始章节序号 */
  startChapterOrder?: number | null;
  /** 结束章节序号 */
  endChapterOrder?: number | null;
  /** 当前章节序号 */
  currentChapterOrder?: number | null;
}

/** 动态角色总览 */
export interface DynamicCharacterOverview {
  /** 小说 ID */
  novelId: string;
  /** 当前卷信息 */
  currentVolume: DynamicCharacterCurrentVolume | null;
  /** 摘要 */
  summary: string;
  /** 待处理候选数 */
  pendingCandidateCount: number;
  /** 角色列表 */
  characters: DynamicCharacterOverviewItem[];
  /** 关系阶段列表 */
  relations: CharacterRelationStage[];
  /** 候选列表 */
  candidates: CharacterCandidate[];
  /** 阵营追踪列表 */
  factionTracks: CharacterFactionTrack[];
  /** 卷分配列表 */
  assignments: CharacterVolumeAssignment[];
}

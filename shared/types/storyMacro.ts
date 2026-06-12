/** 故事宏观规划字段名 */
export type StoryMacroField =
  | "expanded_premise"
  | "protagonist_core"
  | "conflict_engine"
  | "conflict_layers"
  | "mystery_box"
  | "emotional_line"
  | "setpiece_seeds"
  | "tone_reference"
  | "selling_point"
  | "core_conflict"
  | "main_hook"
  | "progression_loop"
  | "growth_path"
  | "major_payoffs"
  | "ending_flavor"
  | "constraints";

/** 故事冲突层次 */
export interface StoryConflictLayers {
  /** 外部冲突 */
  external: string;
  /** 内部冲突 */
  internal: string;
  /** 关系冲突 */
  relational: string;
}

/** 故事宏观规划字段值的联合类型 */
export type StoryMacroFieldValue = string | string[] | StoryConflictLayers;

/** 故事拆解（核心要素） */
export interface StoryDecomposition {
  /** 卖点 */
  selling_point: string;
  /** 核心冲突 */
  core_conflict: string;
  /** 主要钩子 */
  main_hook: string;
  /** 推进循环 */
  progression_loop: string;
  /** 成长路线 */
  growth_path: string;
  /** 主要伏笔 */
  major_payoffs: string[];
  /** 结局风格 */
  ending_flavor: string;
}

/** 故事扩展详情 */
export interface StoryExpansion {
  /** 扩展前提 */
  expanded_premise: string;
  /** 主角核心 */
  protagonist_core: string;
  /** 冲突引擎 */
  conflict_engine: string;
  /** 冲突层次 */
  conflict_layers: StoryConflictLayers;
  /** 谜题盒 */
  mystery_box: string;
  /** 情感线 */
  emotional_line: string;
  /** 场景种子 */
  setpiece_seeds: string[];
  /** 调性参考 */
  tone_reference: string;
}

/** 故事宏观规划问题 */
export interface StoryMacroIssue {
  /** 问题类型 */
  type: "conflict" | "missing_info";
  /** 关联字段 */
  field: StoryMacroField | "global";
  /** 问题描述 */
  message: string;
}

/** 故事宏观规划字段锁定映射 */
export type StoryMacroLocks = Partial<Record<StoryMacroField, boolean>>;

/** 故事宏观规划阶段 */
export interface StoryMacroPhase {
  /** 阶段名称 */
  name: string;
  /** 阶段目标 */
  goal: string;
}

/** 故事宏观规划转折点 */
export interface StoryMacroTurningPoint {
  /** 标题 */
  title: string;
  /** 摘要 */
  summary: string;
  /** 所处阶段 */
  phase: string;
}

/** 故事约束引擎 */
export interface StoryConstraintEngine {
  /** 前提 */
  premise: string;
  /** 冲突轴线 */
  conflict_axis: string;
  /** 谜题盒设计 */
  mystery_box: string;
  /** 压力角色 */
  pressure_roles: string[];
  /** 成长路线 */
  growth_path: string[];
  /** 阶段模型 */
  phase_model: StoryMacroPhase[];
  /** 硬性约束 */
  hard_constraints: string[];
  /** 转折点列表 */
  turning_points: StoryMacroTurningPoint[];
  /** 结局约束 */
  ending_constraints: {
    /** 必须包含 */
    must_have: string[];
    /** 不能包含 */
    must_not_have: string[];
  };
}

/** 故事宏观规划运行时状态 */
export interface StoryMacroState {
  /** 当前阶段索引 */
  currentPhase: number;
  /** 进度 */
  progress: number;
  /** 主角状态 */
  protagonistState: string;
}

/** 故事宏观规划方案 */
export interface StoryMacroPlan {
  id: string;
  /** 所属小说 ID */
  novelId: string;
  /** 故事输入 */
  storyInput?: string | null;
  /** 扩展详情 */
  expansion?: StoryExpansion | null;
  /** 核心拆解 */
  decomposition?: StoryDecomposition | null;
  /** 约束列表 */
  constraints: string[];
  /** 问题列表 */
  issues: StoryMacroIssue[];
  /** 已锁定字段 */
  lockedFields: StoryMacroLocks;
  /** 约束引擎 */
  constraintEngine?: StoryConstraintEngine | null;
  /** 运行时状态 */
  state: StoryMacroState;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

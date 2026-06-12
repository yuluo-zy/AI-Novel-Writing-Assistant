/** 世界观接口 */
export interface World {
  id: string;
  /** 世界观名称 */
  name: string;
  /** 描述 */
  description?: string | null;
  /** 世界观类型 */
  worldType?: string | null;
  /** 模板键 */
  templateKey?: string | null;
  /** 公理 */
  axioms?: string | null;
  /** 背景 */
  background?: string | null;
  /** 地理 */
  geography?: string | null;
  /** 文化 */
  cultures?: string | null;
  /** 魔法系统 */
  magicSystem?: string | null;
  /** 政治 */
  politics?: string | null;
  /** 种族 */
  races?: string | null;
  /** 宗教 */
  religions?: string | null;
  /** 科技 */
  technology?: string | null;
  /** 冲突 */
  conflicts?: string | null;
  /** 历史 */
  history?: string | null;
  /** 经济 */
  economy?: string | null;
  /** 阵营 */
  factions?: string | null;
  /** 状态 */
  status: string;
  /** 版本号 */
  version: number;
  /** 选中的维度 */
  selectedDimensions?: string | null;
  /** 选中的元素 */
  selectedElements?: string | null;
  /** 层级状态 */
  layerStates?: string | null;
  /** 一致性报告 */
  consistencyReport?: string | null;
  /** 概览摘要 */
  overviewSummary?: string | null;
  /** 结构 JSON */
  structureJson?: string | null;
  /** 绑定支持 JSON */
  bindingSupportJson?: string | null;
  /** 结构 schema 版本 */
  structureSchemaVersion?: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 世界观结构章节键 */
export type WorldStructureSectionKey =
  | "profile"
  | "rules"
  | "factions"
  | "locations"
  | "relations";

/** 世界观档案 */
export interface WorldProfile {
  /** 摘要 */
  summary: string;
  /** 身份定位 */
  identity: string;
  /** 基调 */
  tone: string;
  /** 主题列表 */
  themes: string[];
  /** 核心冲突 */
  coreConflict: string;
}

/** 世界观规则 */
export interface WorldRule {
  id: string;
  /** 规则名称 */
  name: string;
  /** 规则摘要 */
  summary: string;
  /** 代价 */
  cost: string;
  /** 边界 */
  boundary: string;
  /** 执行机制 */
  enforcement: string;
}

/** 世界观规约体系 */
export interface WorldRules {
  /** 摘要 */
  summary: string;
  /** 公理列表 */
  axioms: WorldRule[];
  /** 禁忌列表 */
  taboo: string[];
  /** 共同后果 */
  sharedConsequences: string[];
}

/** 世界观阵营 */
export interface WorldFaction {
  id: string;
  /** 名称 */
  name: string;
  /** 立场 */
  position: string;
  /** 信条 */
  doctrine: string;
  /** 目标 */
  goals: string[];
  /** 手段 */
  methods: string[];
  /** 代表势力 ID 列表 */
  representativeForceIds: string[];
}

/** 世界观势力 */
export interface WorldForce {
  id: string;
  /** 名称 */
  name: string;
  /** 类型 */
  type: string;
  /** 所属阵营 ID */
  factionId?: string | null;
  /** 角色 */
  role?: string | null;
  /** 资源 */
  resources?: string[];
  /** 控制地点 ID 列表 */
  controlledLocationIds?: string[];
  /** 摘要 */
  summary: string;
  /** 权力根基 */
  baseOfPower: string;
  /** 当前目标 */
  currentObjective: string;
  /** 压力 */
  pressure: string;
  /** 领导者 */
  leader?: string | null;
  /** 叙事角色 */
  narrativeRole: string;
}

/** 世界观地点 */
export interface WorldLocation {
  id: string;
  /** 名称 */
  name: string;
  /** 类型 */
  type?: string | null;
  /** 地区 */
  region?: string | null;
  x?: number;
  y?: number;
  /** 方位提示 */
  directionHint?: WorldGeographyDirection;
  /** 地形 */
  terrain: string;
  /** 摘要 */
  summary: string;
  /** 叙事功能 */
  narrativeFunction: string;
  /** 风险 */
  risk: string;
  /** 风险等级 */
  riskLevel?: number;
  /** 故事相关性 */
  storyRelevance?: string;
  /** 进入条件 */
  entryConstraint: string;
  /** 离开代价 */
  exitCost: string;
  /** 控制方势力 ID 列表 */
  controllingForceIds: string[];
}

/** 世界观地理方位 */
export type WorldGeographyDirection =
  | "north"
  | "south"
  | "east"
  | "west"
  | "center"
  | "northeast"
  | "northwest"
  | "southeast"
  | "southwest";

/** 世界观地理区域类型 */
export type WorldGeographyRegionType =
  | "continent"
  | "country"
  | "region"
  | "city"
  | "landmark"
  | "border"
  | "route"
  | "other";

/** 世界观地理路线类型 */
export type WorldGeographyRouteType =
  | "road"
  | "river"
  | "sea"
  | "portal"
  | "trade"
  | "military"
  | "border"
  | "other";

/** 世界观地理地图节点 */
export interface WorldGeographyMapNode {
  id: string;
  /** 标签 */
  label: string;
  x?: number;
  y?: number;
  /** 方位提示 */
  directionHint?: WorldGeographyDirection;
  /** 区域类型 */
  regionType?: WorldGeographyRegionType;
  /** 地形 */
  terrain?: string;
  /** 摘要 */
  summary?: string;
  /** 父节点 ID */
  parentId?: string | null;
  /** 控制方势力 ID 列表 */
  controllingForceIds?: string[];
  /** 风险 */
  risk?: string;
  /** 故事相关性 */
  storyRelevance?: string;
}

/** 世界观地理地图边 */
export interface WorldGeographyMapEdge {
  /** 源节点 */
  source: string;
  /** 目标节点 */
  target: string;
  /** 关系 */
  relation: string;
  /** 路线类型 */
  routeType?: WorldGeographyRouteType;
  /** 距离提示 */
  distanceHint?: string;
  /** 方向 */
  direction?: WorldGeographyDirection;
  /** 风险 */
  risk?: string;
}

/** 世界观势力关系 */
export interface WorldForceRelation {
  id: string;
  /** 源势力 ID */
  sourceForceId: string;
  /** 目标势力 ID */
  targetForceId: string;
  /** 关系描述 */
  relation: string;
  /** 紧张程度 */
  tension: string;
  /** 详情 */
  detail: string;
}

/** 世界观地点控制关系 */
export interface WorldLocationControlRelation {
  id: string;
  /** 势力 ID */
  forceId: string;
  /** 地点 ID */
  locationId: string;
  /** 关系描述 */
  relation: string;
  /** 详情 */
  detail: string;
}

/** 世界观地点连接关系 */
export interface WorldLocationConnectionRelation {
  id: string;
  /** 源地点 ID */
  sourceLocationId: string;
  /** 目标地点 ID */
  targetLocationId: string;
  /** 连接类型 */
  connectionType: string;
  /** 距离提示 */
  distanceHint: string;
  /** 叙事用途 */
  narrativeUse: string;
}

/** 世界观关系集合 */
export interface WorldRelations {
  /** 势力关系列表 */
  forceRelations: WorldForceRelation[];
  /** 地点控制关系列表 */
  locationControls: WorldLocationControlRelation[];
  /** 地点连接关系列表 */
  locationConnections?: WorldLocationConnectionRelation[];
}

/** 世界观绑定地点集群 */
export interface WorldBindingLocationCluster {
  id: string;
  /** 标签 */
  label: string;
  /** 地点 ID 列表 */
  locationIds: string[];
  /** 选择理由 */
  reason: string;
}

/** 世界观绑定支持信息 */
export interface WorldBindingSupport {
  /** 推荐入口点 */
  recommendedEntryPoints: string[];
  /** 高压力势力 */
  highPressureForces: string[];
  /** 建议的地点集群 */
  suggestedLocationClusters: WorldBindingLocationCluster[];
  /** 兼容冲突 */
  compatibleConflicts: string[];
  /** 禁止组合 */
  forbiddenCombinations: string[];
}

/** 世界观结构元数据 */
export interface WorldStructureMeta {
  /** schema 版本 */
  schemaVersion: number;
  /** 种子来源 */
  seededFrom?: string | null;
  /** 最后回填时间 */
  lastBackfilledAt?: string | null;
  /** 最后生成时间 */
  lastGeneratedAt?: string | null;
  /** 最后生成的章节 */
  lastSectionGenerated?: WorldStructureSectionKey | null;
}

/** 世界观结构化数据 */
export interface WorldStructuredData {
  /** 档案 */
  profile: WorldProfile;
  /** 规约体系 */
  rules: WorldRules;
  /** 阵营列表 */
  factions: WorldFaction[];
  /** 势力列表 */
  forces: WorldForce[];
  /** 地点列表 */
  locations: WorldLocation[];
  /** 关系集合 */
  relations: WorldRelations;
  /** 元数据 */
  metadata: WorldStructureMeta;
}

/** 世界观属性库条目 */
export interface WorldPropertyLibrary {
  id: string;
  /** 名称 */
  name: string;
  /** 描述 */
  description?: string | null;
  /** 分类 */
  category: string;
  /** 世界观类型 */
  worldType?: string | null;
  /** 使用次数 */
  usageCount: number;
  /** 源世界观 ID */
  sourceWorldId?: string | null;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 世界观层级键 */
export type WorldLayerKey =
  | "foundation"
  | "power"
  | "society"
  | "culture"
  | "history"
  | "conflict";

/** 世界观层级状态 */
export interface WorldLayerState {
  /** 层级键 */
  key: WorldLayerKey;
  /** 状态 */
  status: "pending" | "generated" | "confirmed" | "stale";
  /** 更新时间 */
  updatedAt?: string;
}

/** 世界观公理 */
export interface WorldAxiom {
  /** 公理文本 */
  text: string;
  /** 来源 */
  source?: "user" | "ai";
}

/** 世界观模板 */
export interface WorldTemplate {
  /** 模板键 */
  key: string;
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 世界观类型 */
  worldType: string;
  /** 必需层级 */
  requiredLayers: WorldLayerKey[];
  /** 可选层级 */
  optionalLayers: WorldLayerKey[];
  /** 经典元素 */
  classicElements: string[];
  /** 常见陷阱 */
  pitfalls: string[];
}

/** 世界观深化问题 */
export interface WorldDeepeningQuestion {
  id: string;
  /** 世界观 ID */
  worldId: string;
  /** 优先级 */
  priority: "required" | "recommended" | "optional";
  /** 问题 */
  question: string;
  /** 快速选项 */
  quickOptions?: string[];
  /** 目标层级 */
  targetLayer?: WorldLayerKey;
  /** 目标字段 */
  targetField?: string;
  /** 答案 */
  answer?: string | null;
  /** 整合摘要 */
  integratedSummary?: string | null;
  /** 状态 */
  status: "pending" | "answered" | "integrated";
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 世界观一致性问题 */
export interface WorldConsistencyIssue {
  id: string;
  /** 世界观 ID */
  worldId: string;
  /** 严重程度 */
  severity: "pass" | "warn" | "error";
  /** 编码 */
  code: string;
  /** 消息 */
  message: string;
  /** 详情 */
  detail?: string | null;
  /** 来源 */
  source: "rule" | "llm";
  /** 状态 */
  status: "open" | "resolved" | "ignored";
  /** 目标字段 */
  targetField?: string | null;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 世界观一致性报告 */
export interface WorldConsistencyReport {
  /** 世界观 ID */
  worldId: string;
  /** 分数 */
  score: number;
  /** 摘要 */
  summary: string;
  /** 总体状态 */
  status: "pass" | "warn" | "error";
  /** 生成时间 */
  generatedAt?: string;
  /** 问题列表 */
  issues: WorldConsistencyIssue[];
}

/** 世界观快照 */
export interface WorldSnapshot {
  id: string;
  /** 世界观 ID */
  worldId: string;
  /** 标签 */
  label?: string | null;
  /** 数据 */
  data: string;
  /** 创建时间 */
  createdAt: string;
}

/** 世界观可视化数据 */
export interface WorldVisualizationPayload {
  /** 世界观 ID */
  worldId: string;
  /** 阵营图 */
  factionGraph: {
    nodes: Array<{ id: string; label: string; type: string }>;
    edges: Array<{ source: string; target: string; relation: string }>;
  };
  /** 力量体系树 */
  powerTree: Array<{ level: string; description: string }>;
  /** 地理地图 */
  geographyMap: {
    nodes: WorldGeographyMapNode[];
    edges: WorldGeographyMapEdge[];
  };
  /** 时间线 */
  timeline: Array<{ year: string; event: string }>;
}

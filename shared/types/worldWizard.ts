import type {
  WorldBindingSupport,
  WorldFaction,
  WorldForce,
  WorldLayerKey,
  WorldLocation,
  WorldRule,
  WorldStructuredData,
} from "./world";

/** 世界观选项精化等级 */
export type WorldOptionRefinementLevel = "basic" | "standard" | "detailed";
/** 世界观参考模式 */
export type WorldReferenceMode = "extract_base" | "adapt_world" | "tone_rebuild";
/** 世界观骨架预设 */
export type WorldSkeletonPreset = "light" | "standard" | "epic";

/** 世界观骨架生成计数 */
export interface WorldSkeletonGenerationCounts {
  rules: number;
  factionGroups: number;
  forces: number;
  locations: number;
  conflicts: number;
  storyEntrySuggestions: number;
}

/** 世界观骨架生成选项 */
export interface WorldSkeletonGenerationOptions {
  preset: WorldSkeletonPreset;
  counts: WorldSkeletonGenerationCounts;
}

/** 世界观骨架故事入口建议 */
export interface WorldSkeletonStoryEntrySuggestion {
  title: string;
  description: string;
  recommendedLocationIds: string[];
  involvedForceIds: string[];
  firstConflict: string;
}

/** 世界观骨架评估 */
export interface WorldSkeletonAssessment {
  completenessScore: number;
  readyForNovelUse: boolean;
  missingParts: Array<{
    area: "rules" | "forces" | "locations" | "relations" | "storyEntry";
    issue: string;
    suggestedAction: string;
  }>;
  recommendedNextActions: string[];
}

/** 世界观骨架生成负载 */
export interface WorldSkeletonGenerationPayload {
  concept: {
    name: string;
    oneSentence: string;
    readerImpression: string;
    genrePromise: string;
  };
  structuredData: WorldStructuredData;
  bindingSupport: WorldBindingSupport;
  storyEntrySuggestions: WorldSkeletonStoryEntrySuggestion[];
  assessment: WorldSkeletonAssessment;
}

/** 预设骨架生成计数 */
export const WORLD_SKELETON_PRESET_COUNTS: Record<WorldSkeletonPreset, WorldSkeletonGenerationCounts> = {
  light: {
    rules: 3,
    factionGroups: 2,
    forces: 3,
    locations: 4,
    conflicts: 2,
    storyEntrySuggestions: 2,
  },
  standard: {
    rules: 5,
    factionGroups: 3,
    forces: 5,
    locations: 6,
    conflicts: 4,
    storyEntrySuggestions: 3,
  },
  epic: {
    rules: 6,
    factionGroups: 4,
    forces: 7,
    locations: 9,
    conflicts: 6,
    storyEntrySuggestions: 4,
  },
};

/** 骨架生成数量限制 */
export const WORLD_SKELETON_COUNT_LIMITS: Record<keyof WorldSkeletonGenerationCounts, { min: number; max: number }> = {
  rules: { min: 3, max: 6 },
  factionGroups: { min: 2, max: 5 },
  forces: { min: 3, max: 9 },
  locations: { min: 3, max: 10 },
  conflicts: { min: 2, max: 8 },
  storyEntrySuggestions: { min: 1, max: 5 },
};

/** 规范化世界观骨架生成选项 */
export function normalizeWorldSkeletonGenerationOptions(
  raw: Partial<WorldSkeletonGenerationOptions> | null | undefined,
): WorldSkeletonGenerationOptions {
  const preset: WorldSkeletonPreset =
    raw?.preset === "light" || raw?.preset === "epic" || raw?.preset === "standard"
      ? raw.preset
      : "standard";
  const defaults = WORLD_SKELETON_PRESET_COUNTS[preset];
  const rawCounts = raw?.counts ?? {};
  const counts = Object.fromEntries(
    Object.entries(WORLD_SKELETON_COUNT_LIMITS).map(([key, limit]) => {
      const value = Number((rawCounts as Record<string, unknown>)[key]);
      const fallback = defaults[key as keyof WorldSkeletonGenerationCounts];
      return [
        key,
        Number.isFinite(value)
          ? Math.max(limit.min, Math.min(limit.max, Math.floor(value)))
          : fallback,
      ];
    }),
  ) as unknown as WorldSkeletonGenerationCounts;
  return { preset, counts };
}

/** 世界观参考锚点 */
export interface WorldReferenceAnchor {
  id: string;
  label: string;
  content: string;
}

export interface WorldReferenceRuleSeed extends Pick<WorldRule, "id" | "name" | "summary" | "cost" | "boundary" | "enforcement"> {}

export interface WorldReferenceFactionSeed extends Pick<WorldFaction, "id" | "name" | "position" | "doctrine" | "goals" | "methods" | "representativeForceIds"> {}

export interface WorldReferenceForceSeed extends Pick<
  WorldForce,
  "id" | "name" | "type" | "factionId" | "summary" | "baseOfPower" | "currentObjective" | "pressure" | "leader" | "narrativeRole"
> {}

export interface WorldReferenceLocationSeed extends Pick<
  WorldLocation,
  "id" | "name" | "terrain" | "summary" | "narrativeFunction" | "risk" | "entryConstraint" | "exitCost" | "controllingForceIds"
> {}

/** 世界观参考种子包 */
export interface WorldReferenceSeedBundle {
  rules: WorldReferenceRuleSeed[];
  factions: WorldReferenceFactionSeed[];
  forces: WorldReferenceForceSeed[];
  locations: WorldReferenceLocationSeed[];
}

/** 世界观参考种子选择 */
export interface WorldReferenceSeedSelection {
  ruleIds: string[];
  factionIds: string[];
  forceIds: string[];
  locationIds: string[];
}

/** 世界观参考上下文 */
export interface WorldReferenceContext {
  mode: WorldReferenceMode;
  preserveElements: string[];
  allowedChanges: string[];
  forbiddenElements: string[];
  anchors: WorldReferenceAnchor[];
  referenceSeeds?: WorldReferenceSeedBundle | null;
  selectedSeedIds?: WorldReferenceSeedSelection | null;
}

export interface WorldPropertyChoice {
  id: string;
  label: string;
  summary: string;
}

export interface WorldPropertyOption {
  id: string;
  name: string;
  description: string;
  targetLayer: WorldLayerKey;
  reason?: string | null;
  choices?: WorldPropertyChoice[];
  source: "ai" | "library";
  libraryItemId?: string | null;
  sourceCategory?: string | null;
}

export interface WorldPropertySelection {
  optionId: string;
  name: string;
  description: string;
  targetLayer: WorldLayerKey;
  detail?: string | null;
  choiceId?: string | null;
  choiceLabel?: string | null;
  choiceSummary?: string | null;
  source: "ai" | "library";
  libraryItemId?: string | null;
  sourceCategory?: string | null;
}

/** 世界观生成蓝图 */
export interface WorldGenerationBlueprint {
  version: 1;
  classicElements: string[];
  propertySelections: WorldPropertySelection[];
  referenceContext?: WorldReferenceContext | null;
}

const WORLD_LAYER_KEYS: WorldLayerKey[] = [
  "foundation",
  "power",
  "society",
  "culture",
  "history",
  "conflict",
];

const WORLD_LAYER_KEY_SET = new Set<WorldLayerKey>(WORLD_LAYER_KEYS);

export function isWorldLayerKey(value: string): value is WorldLayerKey {
  return WORLD_LAYER_KEY_SET.has(value as WorldLayerKey);
}

/** 规范化世界观生成蓝图 */
export function normalizeWorldGenerationBlueprint(
  raw: unknown,
): WorldGenerationBlueprint {
  if (!raw) {
    return {
      version: 1,
      classicElements: [],
      propertySelections: [],
    };
  }

  if (Array.isArray(raw)) {
    const classicElements = raw
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
    return {
      version: 1,
      classicElements: Array.from(new Set(classicElements)),
      propertySelections: [],
    };
  }

  if (typeof raw !== "object") {
    return {
      version: 1,
      classicElements: [],
      propertySelections: [],
      referenceContext: null,
    };
  }

  const record = raw as Record<string, unknown>;
  const classicElements = Array.isArray(record.classicElements)
    ? record.classicElements
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean)
    : [];

  const propertySelections = Array.isArray(record.propertySelections)
    ? record.propertySelections
      .map<WorldPropertySelection | null>((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }
        const selection = item as Record<string, unknown>;
        const optionId = typeof selection.optionId === "string"
          ? selection.optionId.trim()
          : typeof selection.id === "string"
            ? selection.id.trim()
            : "";
        const name = typeof selection.name === "string" ? selection.name.trim() : "";
        const description = typeof selection.description === "string" ? selection.description.trim() : "";
        const detail = typeof selection.detail === "string" ? selection.detail.trim() : "";
        const choiceId = typeof selection.choiceId === "string" ? selection.choiceId.trim() : "";
        const choiceLabel = typeof selection.choiceLabel === "string" ? selection.choiceLabel.trim() : "";
        const choiceSummary = typeof selection.choiceSummary === "string" ? selection.choiceSummary.trim() : "";
        const targetLayer = typeof selection.targetLayer === "string" && isWorldLayerKey(selection.targetLayer)
          ? selection.targetLayer
          : null;
        const source = selection.source === "library" ? "library" : "ai";
        const libraryItemId = typeof selection.libraryItemId === "string" ? selection.libraryItemId.trim() : "";
        const sourceCategory = typeof selection.sourceCategory === "string"
          ? selection.sourceCategory.trim()
          : "";

        if (!optionId || !name || !description || !targetLayer) {
          return null;
        }

        return {
          optionId,
          name,
          description,
          detail: detail || null,
          choiceId: choiceId || null,
          choiceLabel: choiceLabel || null,
          choiceSummary: choiceSummary || null,
          targetLayer,
          source,
          libraryItemId: libraryItemId || null,
          sourceCategory: sourceCategory || null,
        };
      })
      .filter((item): item is WorldPropertySelection => Boolean(item))
    : [];

  const referenceContext = normalizeWorldReferenceContext(record.referenceContext);

  return {
    version: 1,
    classicElements: Array.from(new Set(classicElements)),
    propertySelections,
    referenceContext,
  };
}

/** 解析世界观生成蓝图 */
export function parseWorldGenerationBlueprint(
  raw: string | null | undefined,
): WorldGenerationBlueprint {
  if (!raw?.trim()) {
    return normalizeWorldGenerationBlueprint(null);
  }

  try {
    return normalizeWorldGenerationBlueprint(JSON.parse(raw));
  } catch {
    return normalizeWorldGenerationBlueprint(raw);
  }
}

/** 序列化世界观生成蓝图 */
export function serializeWorldGenerationBlueprint(
  blueprint: WorldGenerationBlueprint,
): string {
  return JSON.stringify(normalizeWorldGenerationBlueprint(blueprint));
}

function normalizeReferenceAnchor(raw: unknown, index: number): WorldReferenceAnchor | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const label = typeof record.label === "string" ? record.label.trim() : "";
  const content = typeof record.content === "string" ? record.content.trim() : "";
  const id = typeof record.id === "string" ? record.id.trim() : "";
  if (!label || !content) {
    return null;
  }
  return {
    id: id || `anchor-${index + 1}`,
    label,
    content,
  };
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return Array.from(
    new Set(
      value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean),
    ),
  );
}

function normalizeReferenceRuleSeed(raw: unknown, index: number): WorldReferenceRuleSeed | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const summary = typeof record.summary === "string" ? record.summary.trim() : "";
  const id = typeof record.id === "string" ? record.id.trim() : "";
  if (!name && !summary) {
    return null;
  }
  return {
    id: id || `reference-rule-${index + 1}`,
    name: name || `原作规则 ${index + 1}`,
    summary,
    cost: typeof record.cost === "string" ? record.cost.trim() : "",
    boundary: typeof record.boundary === "string" ? record.boundary.trim() : "",
    enforcement: typeof record.enforcement === "string" ? record.enforcement.trim() : "",
  };
}

function normalizeReferenceFactionSeed(raw: unknown, index: number): WorldReferenceFactionSeed | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const id = typeof record.id === "string" ? record.id.trim() : "";
  if (!name) {
    return null;
  }
  return {
    id: id || `reference-faction-${index + 1}`,
    name,
    position: typeof record.position === "string" ? record.position.trim() : "",
    doctrine: typeof record.doctrine === "string" ? record.doctrine.trim() : "",
    goals: normalizeStringList(record.goals),
    methods: normalizeStringList(record.methods),
    representativeForceIds: normalizeStringList(record.representativeForceIds),
  };
}

function normalizeReferenceForceSeed(raw: unknown, index: number): WorldReferenceForceSeed | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const id = typeof record.id === "string" ? record.id.trim() : "";
  if (!name) {
    return null;
  }
  return {
    id: id || `reference-force-${index + 1}`,
    name,
    type: typeof record.type === "string" ? record.type.trim() : "",
    factionId: typeof record.factionId === "string" ? record.factionId.trim() : null,
    summary: typeof record.summary === "string" ? record.summary.trim() : "",
    baseOfPower: typeof record.baseOfPower === "string" ? record.baseOfPower.trim() : "",
    currentObjective: typeof record.currentObjective === "string" ? record.currentObjective.trim() : "",
    pressure: typeof record.pressure === "string" ? record.pressure.trim() : "",
    leader: typeof record.leader === "string" ? record.leader.trim() : null,
    narrativeRole: typeof record.narrativeRole === "string" ? record.narrativeRole.trim() : "",
  };
}

function normalizeReferenceLocationSeed(raw: unknown, index: number): WorldReferenceLocationSeed | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const id = typeof record.id === "string" ? record.id.trim() : "";
  if (!name) {
    return null;
  }
  return {
    id: id || `reference-location-${index + 1}`,
    name,
    terrain: typeof record.terrain === "string" ? record.terrain.trim() : "",
    summary: typeof record.summary === "string" ? record.summary.trim() : "",
    narrativeFunction: typeof record.narrativeFunction === "string" ? record.narrativeFunction.trim() : "",
    risk: typeof record.risk === "string" ? record.risk.trim() : "",
    entryConstraint: typeof record.entryConstraint === "string" ? record.entryConstraint.trim() : "",
    exitCost: typeof record.exitCost === "string" ? record.exitCost.trim() : "",
    controllingForceIds: normalizeStringList(record.controllingForceIds),
  };
}

export function createEmptyWorldReferenceSeedBundle(): WorldReferenceSeedBundle {
  return {
    rules: [],
    factions: [],
    forces: [],
    locations: [],
  };
}

export function createEmptyWorldReferenceSeedSelection(): WorldReferenceSeedSelection {
  return {
    ruleIds: [],
    factionIds: [],
    forceIds: [],
    locationIds: [],
  };
}

export function normalizeWorldReferenceSeedBundle(raw: unknown): WorldReferenceSeedBundle {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return createEmptyWorldReferenceSeedBundle();
  }

  const record = raw as Record<string, unknown>;
  const rules = Array.isArray(record.rules)
    ? record.rules
      .map((item, index) => normalizeReferenceRuleSeed(item, index))
      .filter((item): item is WorldReferenceRuleSeed => Boolean(item))
    : [];
  const factions = Array.isArray(record.factions)
    ? record.factions
      .map((item, index) => normalizeReferenceFactionSeed(item, index))
      .filter((item): item is WorldReferenceFactionSeed => Boolean(item))
    : [];
  const forces = Array.isArray(record.forces)
    ? record.forces
      .map((item, index) => normalizeReferenceForceSeed(item, index))
      .filter((item): item is WorldReferenceForceSeed => Boolean(item))
    : [];
  const locations = Array.isArray(record.locations)
    ? record.locations
      .map((item, index) => normalizeReferenceLocationSeed(item, index))
      .filter((item): item is WorldReferenceLocationSeed => Boolean(item))
    : [];

  return {
    rules: Array.from(new Map(rules.map((item) => [item.id, item])).values()),
    factions: Array.from(new Map(factions.map((item) => [item.id, item])).values()),
    forces: Array.from(new Map(forces.map((item) => [item.id, item])).values()),
    locations: Array.from(new Map(locations.map((item) => [item.id, item])).values()),
  };
}

export function normalizeWorldReferenceSeedSelection(raw: unknown): WorldReferenceSeedSelection {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return createEmptyWorldReferenceSeedSelection();
  }

  const record = raw as Record<string, unknown>;
  return {
    ruleIds: normalizeStringList(record.ruleIds),
    factionIds: normalizeStringList(record.factionIds),
    forceIds: normalizeStringList(record.forceIds),
    locationIds: normalizeStringList(record.locationIds),
  };
}

export function normalizeWorldReferenceContext(raw: unknown): WorldReferenceContext | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const mode = record.mode === "extract_base" || record.mode === "adapt_world" || record.mode === "tone_rebuild"
    ? record.mode
    : null;

  if (!mode) {
    return null;
  }

  const anchors = Array.isArray(record.anchors)
    ? record.anchors
      .map((item, index) => normalizeReferenceAnchor(item, index))
      .filter((item): item is WorldReferenceAnchor => Boolean(item))
    : [];

  return {
    mode,
    preserveElements: normalizeStringList(record.preserveElements),
    allowedChanges: normalizeStringList(record.allowedChanges),
    forbiddenElements: normalizeStringList(record.forbiddenElements),
    anchors,
    referenceSeeds: normalizeWorldReferenceSeedBundle(record.referenceSeeds ?? record.seedPackage),
    selectedSeedIds: normalizeWorldReferenceSeedSelection(record.selectedSeedIds),
  };
}

/** 将世界观库分类映射到层级键 */
export function mapWorldLibraryCategoryToLayer(category: string | null | undefined): WorldLayerKey {
  const normalized = (category ?? "").trim().toLowerCase();
  switch (normalized) {
    case "terrain":
      return "foundation";
    case "power_system":
    case "artifact":
      return "power";
    case "race":
    case "organization":
      return "society";
    case "resource":
      return "culture";
    case "event":
      return "history";
    default:
      return "conflict";
  }
}

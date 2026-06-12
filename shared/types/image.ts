/** 图片场景类型：角色图 / 小说封面 / 章节插图 */
export type ImageSceneType = "character" | "novel_cover" | "chapter_illustration";

/** 图片生成任务状态 */
export type ImageTaskStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";

/** 默认小说封面图片尺寸 */
export const DEFAULT_NOVEL_COVER_IMAGE_SIZE = "1024x1536";
/** 默认小说封面生成数量 */
export const DEFAULT_NOVEL_COVER_IMAGE_COUNT = 2;

/** 图片生成任务的基础接口 */
interface BaseImageGenerationTask {
  id: string;
  /** 场景类型 */
  sceneType: ImageSceneType;
  /** 图片提供商 */
  provider: string;
  /** 模型名称 */
  model: string;
  /** 正向提示词 */
  prompt: string;
  /** 反向提示词 */
  negativePrompt?: string | null;
  /** 风格预设 */
  stylePreset?: string | null;
  /** 图片尺寸 */
  size: string;
  /** 生成数量 */
  imageCount: number;
  /** 随机种子 */
  seed?: number | null;
  /** 任务状态 */
  status: ImageTaskStatus;
  /** 进度 (0-100) */
  progress: number;
  /** 重试次数 */
  retryCount: number;
  /** 最大重试次数 */
  maxRetries: number;
  /** 最后心跳时间 */
  heartbeatAt?: string | null;
  /** 当前阶段 */
  currentStage?: string | null;
  /** 当前项键 */
  currentItemKey?: string | null;
  /** 当前项标签 */
  currentItemLabel?: string | null;
  /** 取消请求时间 */
  cancelRequestedAt?: string | null;
  /** 错误信息 */
  error?: string | null;
  /** 开始时间 */
  startedAt?: string | null;
  /** 完成时间 */
  finishedAt?: string | null;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 角色图片生成任务 */
export type CharacterImageGenerationTask = BaseImageGenerationTask & {
  sceneType: "character";
  baseCharacterId: string;
  novelId?: null;
};

/** 小说封面生成任务 */
export type NovelCoverImageGenerationTask = BaseImageGenerationTask & {
  sceneType: "novel_cover";
  novelId: string;
  baseCharacterId?: null;
};

/** 章节插图生成任务 */
export type ChapterIllustrationImageGenerationTask = BaseImageGenerationTask & {
  sceneType: "chapter_illustration";
  baseCharacterId?: string | null;
  novelId?: string | null;
};

/** 图片生成任务的联合类型 */
export type ImageGenerationTask =
  | CharacterImageGenerationTask
  | NovelCoverImageGenerationTask
  | ChapterIllustrationImageGenerationTask;

/** 图片资产的基础接口 */
interface BaseImageAsset {
  id: string;
  /** 所属任务 ID */
  taskId: string;
  /** 场景类型 */
  sceneType: ImageSceneType;
  /** 图片提供商 */
  provider: string;
  /** 模型名称 */
  model: string;
  /** 图片 URL */
  url: string;
  /** 本地路径 */
  localPath?: string | null;
  /** 来源 URL */
  sourceUrl?: string | null;
  /** MIME 类型 */
  mimeType?: string | null;
  /** 图片宽度 */
  width?: number | null;
  /** 图片高度 */
  height?: number | null;
  /** 随机种子 */
  seed?: number | null;
  /** 生成提示词 */
  prompt?: string | null;
  /** 是否为主图 */
  isPrimary: boolean;
  /** 排序序号 */
  sortOrder: number;
  /** 元数据 */
  metadata?: string | null;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 角色图片资产 */
export type CharacterImageAsset = BaseImageAsset & {
  sceneType: "character";
  baseCharacterId: string;
  novelId?: null;
};

/** 小说封面资产 */
export type NovelCoverImageAsset = BaseImageAsset & {
  sceneType: "novel_cover";
  novelId: string;
  baseCharacterId?: null;
};

/** 章节插图资产 */
export type ChapterIllustrationImageAsset = BaseImageAsset & {
  sceneType: "chapter_illustration";
  baseCharacterId?: string | null;
  novelId?: string | null;
};

/** 图片资产的联合类型 */
export type ImageAsset =
  | CharacterImageAsset
  | NovelCoverImageAsset
  | ChapterIllustrationImageAsset;

/** 知识文档状态 */
export type KnowledgeDocumentStatus = "enabled" | "disabled" | "archived";
/** 知识索引状态 */
export type KnowledgeIndexStatus = "idle" | "queued" | "running" | "succeeded" | "failed";
/** 知识绑定目标类型 */
export type KnowledgeBindingTargetType = "novel" | "world";

/** 知识文档 */
export interface KnowledgeDocument {
  id: string;
  /** 文档标题 */
  title: string;
  /** 文件名 */
  fileName: string;
  /** 文档状态 */
  status: KnowledgeDocumentStatus;
  /** 活跃版本 ID */
  activeVersionId?: string | null;
  /** 活跃版本号 */
  activeVersionNumber: number;
  /** 最新索引状态 */
  latestIndexStatus: KnowledgeIndexStatus;
  /** 最新索引错误 */
  latestIndexError?: string | null;
  /** 最后索引时间 */
  lastIndexedAt?: string | null;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 知识文档版本 */
export interface KnowledgeDocumentVersion {
  id: string;
  /** 所属文档 ID */
  documentId: string;
  /** 版本号 */
  versionNumber: number;
  /** 文档内容 */
  content: string;
  /** 内容哈希 */
  contentHash: string;
  /** 字符数 */
  charCount: number;
  /** 创建时间 */
  createdAt: string;
}

/** 知识绑定 */
export interface KnowledgeBinding {
  id: string;
  /** 目标类型（小说或世界） */
  targetType: KnowledgeBindingTargetType;
  /** 目标 ID */
  targetId: string;
  /** 文档 ID */
  documentId: string;
  /** 创建时间 */
  createdAt: string;
}

/** 知识文档摘要（含统计信息） */
export interface KnowledgeDocumentSummary extends KnowledgeDocument {
  /** 版本数 */
  versionCount: number;
  /** 关联拆书分析数 */
  bookAnalysisCount: number;
}

/** 知识文档详情（含版本列表） */
export interface KnowledgeDocumentDetail extends KnowledgeDocument {
  bookAnalysisCount: number;
  /** 版本列表（含是否活跃标记） */
  versions: Array<KnowledgeDocumentVersion & { isActive: boolean }>;
}

/** 知识召回测试命中结果 */
export interface KnowledgeRecallTestHit {
  id: string;
  /** 所属文档 ID */
  ownerId: string;
  /** 相似度分数 */
  score: number;
  /** 匹配来源（向量或关键词） */
  source: "vector" | "keyword";
  /** 标题 */
  title?: string;
  /** 匹配文本块 */
  chunkText: string;
  /** 文本块序号 */
  chunkOrder: number;
}

/** 知识召回测试结果 */
export interface KnowledgeRecallTestResult {
  /** 文档 ID */
  documentId: string;
  /** 查询文本 */
  query: string;
  /** 命中结果列表 */
  hits: KnowledgeRecallTestHit[];
}

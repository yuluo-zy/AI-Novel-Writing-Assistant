/** 伏笔台账作用域类型 */
export type PayoffLedgerScopeType = "book" | "volume" | "chapter";
/** 伏笔台账状态 */
export type PayoffLedgerStatus = "setup" | "hinted" | "pending_payoff" | "paid_off" | "failed" | "overdue";

/** 伏笔台账来源引用 */
export interface PayoffLedgerSourceRef {
  /** 来源种类 */
  kind: "major_payoff" | "volume_open_payoff" | "chapter_payoff_ref" | "foreshadow_state" | "open_conflict" | "audit_issue";
  /** 来源 ID */
  refId?: string | null;
  /** 来源标签 */
  refLabel: string;
  /** 关联章节 ID */
  chapterId?: string | null;
  /** 关联章节序号 */
  chapterOrder?: number | null;
  /** 关联卷 ID */
  volumeId?: string | null;
  /** 关联卷排序 */
  volumeSortOrder?: number | null;
}

/** 伏笔台账证据 */
export interface PayoffLedgerEvidence {
  /** 证据摘要 */
  summary: string;
  /** 关联章节 ID */
  chapterId?: string | null;
  /** 关联章节序号 */
  chapterOrder?: number | null;
}

/** 伏笔台账风险信号 */
export interface PayoffLedgerRiskSignal {
  /** 信号编码 */
  code: string;
  /** 严重程度 */
  severity: "low" | "medium" | "high" | "critical";
  /** 摘要 */
  summary: string;
  /** 是否已过时 */
  stale?: boolean;
}

/** 伏笔台账条目 */
export interface PayoffLedgerItem {
  id: string;
  /** 所属小说 ID */
  novelId: string;
  /** 台账键（唯一标识） */
  ledgerKey: string;
  /** 标题 */
  title: string;
  /** 摘要 */
  summary: string;
  /** 作用域类型 */
  scopeType: PayoffLedgerScopeType;
  /** 当前状态 */
  currentStatus: PayoffLedgerStatus;
  /** 目标开始章节序号 */
  targetStartChapterOrder?: number | null;
  /** 目标结束章节序号 */
  targetEndChapterOrder?: number | null;
  /** 首次出现章节序号 */
  firstSeenChapterOrder?: number | null;
  /** 最后被触碰章节序号 */
  lastTouchedChapterOrder?: number | null;
  /** 最后被触碰章节 ID */
  lastTouchedChapterId?: string | null;
  /** 设置章节 ID */
  setupChapterId?: string | null;
  /** 兑现章节 ID */
  payoffChapterId?: string | null;
  /** 最后快照 ID */
  lastSnapshotId?: string | null;
  /** 来源引用列表 */
  sourceRefs: PayoffLedgerSourceRef[];
  /** 证据列表 */
  evidence: PayoffLedgerEvidence[];
  /** 风险信号列表 */
  riskSignals: PayoffLedgerRiskSignal[];
  /** 状态原因 */
  statusReason?: string | null;
  /** 置信度 */
  confidence?: number | null;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 伏笔台账摘要统计 */
export interface PayoffLedgerSummary {
  /** 总条目数 */
  totalCount: number;
  /** 待处理数 */
  pendingCount: number;
  /** 紧急数 */
  urgentCount: number;
  /** 逾期数 */
  overdueCount: number;
  /** 已兑现数 */
  paidOffCount: number;
  /** 失败数 */
  failedCount: number;
  /** 更新时间 */
  updatedAt?: string | null;
}

/** 伏笔台账响应 */
export interface PayoffLedgerResponse {
  /** 摘要统计 */
  summary: PayoffLedgerSummary;
  /** 条目列表 */
  items: PayoffLedgerItem[];
  /** 更新时间 */
  updatedAt?: string | null;
}

/** Agent 运行状态 */
export type AgentRunStatus =
  | "queued"
  | "running"
  | "waiting_approval"
  | "succeeded"
  | "failed"
  | "cancelled";

/** 领域 Agent 名称 */
export type DomainAgentName =
  | "Coordinator"
  | "NovelAgent"
  | "BookAnalysisAgent"
  | "KnowledgeAgent"
  | "WorldAgent"
  | "FormulaAgent"
  | "CharacterAgent";

/** 资源作用域 */
export type ResourceScope =
  | "global"
  | "novel"
  | "chapter"
  | "book_analysis"
  | "knowledge_document"
  | "world"
  | "writing_formula"
  | "base_character"
  | "creative_decision"
  | "snapshot"
  | "generation_job"
  | "agent_run"
  | "task";

/** 工具分类 */
export type ToolCategory = "read" | "inspect" | "mutate" | "run";

/** Agent 步骤类型 */
export type AgentStepType =
  | "planning"
  | "tool_call"
  | "tool_result"
  | "reasoning"
  | "write"
  | "approval"
  | "answer";

/** Agent 步骤状态 */
export type AgentStepStatus = "pending" | "running" | "succeeded" | "failed" | "cancelled";

/** Agent 审批状态 */
export type AgentApprovalStatus = "pending" | "approved" | "rejected" | "expired";

/** Agent 计划风险等级 */
export type AgentPlanRiskLevel = "low" | "medium" | "high";

/** Agent 工具错误编码 */
export type AgentToolErrorCode =
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "PERMISSION_DENIED"
  | "APPROVAL_REQUIRED"
  | "CONFLICT"
  | "TIMEOUT"
  | "INTERNAL";

/** Agent 计划上下文需求 */
export interface AgentPlanContextNeed {
  /** 需求键 */
  key: string;
  /** 是否必需 */
  required: boolean;
  /** 需要理由 */
  reason?: string;
}

/** 资源引用 */
export interface ResourceRef {
  /** 资源类型 */
  type: ResourceScope;
  /** 资源 ID */
  id: string;
  /** 资源标签 */
  label?: string | null;
  /** 路由 */
  route?: string | null;
}

/** Agent 目录条目 */
export interface AgentCatalogAgent {
  /** Agent 名称 */
  name: DomainAgentName;
  /** Agent 标题 */
  title: string;
  /** Agent 描述 */
  description: string;
  /** 资源作用域列表 */
  resourceScopes: ResourceScope[];
}

/** 能力定义 */
export interface CapabilityDefinition {
  /** 能力名称 */
  name: string;
  /** 能力标题 */
  title: string;
  /** 能力描述 */
  description: string;
  /** 工具分类 */
  category: ToolCategory;
  /** 风险等级 */
  riskLevel: AgentPlanRiskLevel;
  /** 所属领域 Agent */
  domainAgent: DomainAgentName;
  /** 资源作用域列表 */
  resourceScopes: ResourceScope[];
  /** 是否需要审批 */
  approvalRequired: boolean;
  /** UI 类型 */
  uiKind?: string;
  /** 后续操作 */
  followupActions?: string[];
  /** 输入 schema 摘要 */
  inputSchemaSummary: string[];
}

/** Agent 目录 */
export interface AgentCatalog {
  /** Agent 列表 */
  agents: AgentCatalogAgent[];
  /** 工具列表 */
  tools: CapabilityDefinition[];
  /** 审批策略摘要 */
  approvalPolicySummary: string[];
}

/** 失败诊断 */
export interface FailureDiagnostic {
  /** 失败编码 */
  failureCode?: string | null;
  /** 失败摘要 */
  failureSummary?: string | null;
  /** 失败详情 */
  failureDetails?: string | null;
  /** 恢复提示 */
  recoveryHint?: string | null;
}

/** Agent 计划操作 */
export interface AgentPlanAction {
  /** 执行 Agent */
  agent: "Planner" | "Writer" | "Reviewer" | "Continuity" | "Repair";
  /** 调用的工具 */
  tool: string;
  /** 执行理由 */
  reason: string;
  /** 幂等键 */
  idempotencyKey: string;
  /** 输入参数 */
  input: Record<string, unknown>;
}

/** Agent 执行计划 */
export interface AgentPlan {
  /** 总体目标 */
  goal: string;
  /** 上下文需求列表 */
  contextNeeds: AgentPlanContextNeed[];
  /** 操作列表 */
  actions: AgentPlanAction[];
  /** 风险等级 */
  riskLevel: AgentPlanRiskLevel;
  /** 是否需要审批 */
  requiresApproval: boolean;
  /** 置信度 */
  confidence: number;
}

/** Agent 运行度量 */
export interface AgentRunMetrics {
  /** 步骤数 */
  stepCount: number;
  /** 成功数 */
  successCount: number;
  /** 失败数 */
  failureCount: number;
  /** 审批数 */
  approvalCount: number;
  /** 待审批数 */
  pendingApprovalCount: number;
  /** 总耗时（毫秒） */
  totalDurationMs: number;
  /** 平均步骤耗时（毫秒） */
  avgStepDurationMs: number;
  /** 总成本（美元） */
  totalCostUsd?: number;
  /** 按错误编码分类的工具失败计数 */
  toolFailureByCode?: Partial<Record<AgentToolErrorCode, number>>;
}

/** Agent 编排模式 */
export type AgentOrchestrationMode = "static" | "dynamic" | "dynamic_fallback_static";

/** 动态执行状态摘要 */
export interface DynamicExecutionStateSummary {
  /** 编排模式 */
  mode: AgentOrchestrationMode;
  /** 当前阶段 */
  currentPhase?: string | null;
  /** 当前步骤 */
  currentStep?: string | null;
  /** 剩余阶段数 */
  remainingPhaseCount?: number;
  /** 剩余步骤数 */
  remainingStepCount?: number;
  /** 是否等待审批 */
  waitingForApproval?: boolean;
  /** 最后重规划原因 */
  lastReplanReason?: string | null;
  /** 回退原因 */
  fallbackReason?: string | null;
}

/** 回放请求 */
export interface ReplayRequest {
  /** 开始步骤 ID */
  fromStepId: string;
  /** 回放模式 */
  mode?: "continue" | "dry_run";
  /** 备注 */
  note?: string;
}

/** Agent 运行记录 */
export interface AgentRun {
  id: string;
  novelId?: string | null;
  chapterId?: string | null;
  /** 会话 ID */
  sessionId: string;
  /** 运行目标 */
  goal: string;
  /** 入口 Agent */
  entryAgent: string;
  /** 运行状态 */
  status: AgentRunStatus;
  /** 当前步骤 */
  currentStep?: string | null;
  /** 当前 Agent */
  currentAgent?: string | null;
  /** 错误信息 */
  error?: string | null;
  /** 开始时间 */
  startedAt?: string | null;
  /** 完成时间 */
  finishedAt?: string | null;
  /** 元数据 JSON */
  metadataJson?: string | null;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** Agent 步骤记录 */
export interface AgentStep {
  id: string;
  /** 所属运行 ID */
  runId: string;
  /** 步骤序号 */
  seq: number;
  /** Agent 名称 */
  agentName: string;
  /** 步骤类型 */
  stepType: AgentStepType;
  /** 步骤状态 */
  status: AgentStepStatus;
  /** 父步骤 ID */
  parentStepId?: string | null;
  /** 幂等键 */
  idempotencyKey?: string | null;
  /** 输入 JSON */
  inputJson?: string | null;
  /** 输出 JSON */
  outputJson?: string | null;
  /** 错误信息 */
  error?: string | null;
  /** 错误编码 */
  errorCode?: AgentToolErrorCode | null;
  /** LLM 提供商 */
  provider?: string | null;
  /** 模型名称 */
  model?: string | null;
  /** token 用量 JSON */
  tokenUsageJson?: string | null;
  /** 成本（美元） */
  costUsd?: number | null;
  /** 耗时（毫秒） */
  durationMs?: number | null;
  /** 创建时间 */
  createdAt: string;
}

/** Agent 审批记录 */
export interface AgentApproval {
  id: string;
  /** 所属运行 ID */
  runId: string;
  /** 关联步骤 ID */
  stepId?: string | null;
  /** 审批类型 */
  approvalType: string;
  /** 目标类型 */
  targetType: string;
  /** 目标 ID */
  targetId: string;
  /** 变更摘要 */
  diffSummary: string;
  /** 审批状态 */
  status: AgentApprovalStatus;
  /** 过期时间 */
  expiresAt?: string | null;
  /** 决策备注 */
  decisionNote?: string | null;
  /** 决策者 */
  decider?: string | null;
  /** 决策时间 */
  decidedAt?: string | null;
  /** 负载 JSON */
  payloadJson?: string | null;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** Agent 运行详情 */
export interface AgentRunDetail {
  /** 运行记录 */
  run: AgentRun;
  /** 步骤列表 */
  steps: AgentStep[];
  /** 审批列表 */
  approvals: AgentApproval[];
  /** 运行度量 */
  metrics?: AgentRunMetrics;
  /** 失败诊断 */
  diagnostics?: FailureDiagnostic;
  /** 来源资源 */
  sourceResource?: ResourceRef | null;
  /** 目标资源列表 */
  targetResources?: ResourceRef[];
  /** 动态执行状态 */
  orchestration?: DynamicExecutionStateSummary | null;
}

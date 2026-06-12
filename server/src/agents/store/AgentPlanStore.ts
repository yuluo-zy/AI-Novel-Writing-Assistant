import { prisma } from "../../db/prisma";
import type { DynamicWorkflowPlan, ReplanTrigger } from "@ai-novel/shared/types/dynamicPlan";

/**
 * 将数据库行（原始列）转换为业务层快照对象
 *
 * - planJson 字符串 → 解析为 DynamicWorkflowPlan 结构化对象
 * - replanTriggerJson 字符串 → 解析为 ReplanTrigger（可能为 null）
 * - createdAt Date → ISO 字符串，方便序列化传输
 */
function toPlanSnapshot(row: {
  id: string;
  runId: string;
  version: number;
  status: string;
  planJson: string;
  completedStepCount: number;
  parentVersionId: string | null;
  replanTriggerJson: string | null;
  createdAt: Date;
}): {
  id: string;
  runId: string;
  version: number;
  status: string;
  plan: DynamicWorkflowPlan;
  completedStepCount: number;
  parentVersionId: string | null;
  replanTrigger: ReplanTrigger | null;
  createdAt: string;
} {
  return {
    id: row.id,
    runId: row.runId,
    version: row.version,
    status: row.status,
    plan: JSON.parse(row.planJson) as DynamicWorkflowPlan,
    completedStepCount: row.completedStepCount,
    parentVersionId: row.parentVersionId,
    replanTrigger: row.replanTriggerJson
      ? (JSON.parse(row.replanTriggerJson) as ReplanTrigger)
      : null,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * AgentPlanStore
 *
 * 负责将 DynamicWorkflowPlan 持久化到数据库（agentPlanSnapshot 表），
 * 支持版本快照的创建、更新、查询、废弃和历史查看。
 *
 * 核心设计模式 —— 版本化快照（Versioned Snapshot）：
 * - 一次 Agent 运行（runId）可产生多个版本的计划快照
 * - 每次重新规划（replan）时，旧版本标记为 inactive，新版本创建为 active
 * - parentVersionId 链条追踪计划的演变历史
 */
export class AgentPlanStore {
  /**
   * 创建计划快照
   * - 状态固定为 "active"（当前生效）
   * - completedStepCount 从 0 开始
   * - 保留父版本 ID，形成版本链
   * - 如有 replanTrigger，记录触发原因
   */
  async createPlanSnapshot(
    runId: string,
    version: number,
    plan: DynamicWorkflowPlan,
    replanTrigger?: ReplanTrigger | null,
  ): Promise<void> {
    await prisma.agentPlanSnapshot.create({
      data: {
        runId,
        version,
        status: "active",
        planJson: JSON.stringify(plan),
        completedStepCount: 0,
        parentVersionId: plan.parentVersionId ?? null,
        replanTriggerJson: replanTrigger ? JSON.stringify(replanTrigger) : null,
      },
    });
  }

  /**
   * 更新已有快照
   * - 按 runId + version 精确定位记录
   * - 更新 plan 内容、已完成步数、可选的 replan 触发信息
   */
  async updatePlanSnapshot(
    runId: string,
    version: number,
    plan: DynamicWorkflowPlan,
    completedStepCount: number,
    replanTrigger?: ReplanTrigger | null,
  ): Promise<void> {
    await prisma.agentPlanSnapshot.updateMany({
      where: { runId, version },
      data: {
        planJson: JSON.stringify(plan),
        completedStepCount,
        replanTriggerJson: replanTrigger ? JSON.stringify(replanTrigger) : undefined,
      },
    });
  }

  /**
   * 获取指定 runId 下最新的 active 计划（只返回计划本体，不含元数据）
   * - 用于 Agent 运行时加载最新生效的计划继续执行
   * - 找不到返回 null
   */
  async getLatestActivePlan(runId: string): Promise<DynamicWorkflowPlan | null> {
    const row = await prisma.agentPlanSnapshot.findFirst({
      where: { runId, status: "active" },
      orderBy: { version: "desc" },
    });
    if (!row) return null;
    return JSON.parse(row.planJson) as DynamicWorkflowPlan;
  }

  /**
   * 获取最新 active 快照的完整元数据（含 id、version、状态等）
   * - 用于查看当前运行状态的快照信息
   * - 与 getLatestActivePlan 不同，它返回包装后的完整快照对象
   */
  async getLatestSnapshot(runId: string) {
    const row = await prisma.agentPlanSnapshot.findFirst({
      where: { runId, status: "active" },
      orderBy: { version: "desc" },
    });
    return row ? toPlanSnapshot(row) : null;
  }

  /**
   * 废弃某个版本的计划
   * - 将指定版本的状态设为 "inactive"（不物理删除）
   * - 通常在 replan 时调用：旧版本 → inactive，再创建新版本 → active
   */
  async supersedePlan(runId: string, version: number): Promise<void> {
    await prisma.agentPlanSnapshot.updateMany({
      where: { runId, version },
      data: { status: "inactive" },
    });
  }

  /**
   * 列出某个 runId 的所有版本历史
   * - 按版本号降序排列（最新的在前）
   * - 每条记录都经过 toPlanSnapshot 完整转换
   * - 用于查看计划的完整变更历史
   */
  async listPlanVersions(runId: string) {
    const rows = await prisma.agentPlanSnapshot.findMany({
      where: { runId },
      orderBy: { version: "desc" },
    });
    return rows.map((row) => toPlanSnapshot(row));
  }
}

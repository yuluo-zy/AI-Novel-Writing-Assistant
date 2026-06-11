import { prisma } from "../../db/prisma";
import type { DynamicWorkflowPlan, ReplanTrigger } from "@ai-novel/shared/types/dynamicPlan";

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

export class AgentPlanStore {
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

  async getLatestActivePlan(runId: string): Promise<DynamicWorkflowPlan | null> {
    const row = await prisma.agentPlanSnapshot.findFirst({
      where: { runId, status: "active" },
      orderBy: { version: "desc" },
    });
    if (!row) return null;
    return JSON.parse(row.planJson) as DynamicWorkflowPlan;
  }

  async getLatestSnapshot(runId: string) {
    const row = await prisma.agentPlanSnapshot.findFirst({
      where: { runId, status: "active" },
      orderBy: { version: "desc" },
    });
    return row ? toPlanSnapshot(row) : null;
  }

  async supersedePlan(runId: string, version: number): Promise<void> {
    await prisma.agentPlanSnapshot.updateMany({
      where: { runId, version },
      data: { status: "inactive" },
    });
  }

  async listPlanVersions(runId: string) {
    const rows = await prisma.agentPlanSnapshot.findMany({
      where: { runId },
      orderBy: { version: "desc" },
    });
    return rows.map((row) => toPlanSnapshot(row));
  }
}

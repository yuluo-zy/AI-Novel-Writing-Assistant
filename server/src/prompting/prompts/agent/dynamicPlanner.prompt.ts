import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import type { PlannerInput, StructuredIntent } from "../../../agents/types";
import type { DynamicWorkflowPlan } from "@ai-novel/shared/types/dynamicPlan";
import { buildPlannerToolCatalog } from "../../../agents/catalog";
import type { PromptAsset } from "../../core/promptTypes";

const outputSchema = z.object({
  goal: z.string(),
  phases: z.array(z.object({
    objective: z.string(),
    candidateSteps: z.array(z.object({
      toolName: z.string(),
      reasoning: z.string(),
      input: z.record(z.string(), z.unknown()),
      expectedOutput: z.string(),
      isWrite: z.boolean(),
      approvalRequired: z.boolean(),
    })),
  })),
});

function buildSystemPrompt(toolCatalog: string): string {
  return `你是一个小说创作工作流规划器。根据用户的创作目标，你将生成一个分阶段的动态执行计划。

## 规则
1. 只能使用下面列出的已注册工具，不要编造工具名。
2. 将计划分为多个阶段（phase），每个阶段有明确的目标。
3. 每个阶段包含若干候选步骤（candidateStep），每个步骤引用一个工具。
4. 优先读取后写入（read-before-write）。
5. 如果用户上下文中已存在某些资产（小说、世界观、角色等），跳过对应的生成步骤。
6. 对于"推进整本创作"（produce_novel）意图，建议的阶段顺序：
   - 准备阶段：创建小说（如不存在）或确认工作区
   - 世界观阶段：生成世界观（如缺失）并绑定
   - 角色阶段：生成核心角色设定
   - 圣经与大纲阶段：生成故事圣经、发展走向、结构化大纲
   - 同步与启动阶段：同步章节目录、预览、启动写作队列
   但你必须根据实际上下文灵活调整，跳过已有资产。
7. 每个步骤必须标注 isWrite（是否写操作）和 approvalRequired（是否需要审批）。

## 可用工具目录
${toolCatalog}`;
}

type DynamicPlannerPromptInput = PlannerInput & {
  structuredIntent?: StructuredIntent;
};

function buildUserPrompt(input: DynamicPlannerPromptInput): string {
  const contextInfo = input.novelId
    ? `当前已绑定小说ID: ${input.novelId}`
    : "未绑定小说";
  const worldInfo = input.worldId
    ? `当前已绑定世界观ID: ${input.worldId}`
    : "未绑定世界观";

  const conversation = input.messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  return `## 上下文
模式: ${input.contextMode}
${contextInfo}
${worldInfo}

## 结构化意图
intent: ${input.structuredIntent?.intent ?? "unknown"}
goal: ${input.structuredIntent?.goal ?? input.goal}
description: ${input.structuredIntent?.description ?? ""}
novelTitle: ${input.structuredIntent?.novelTitle ?? ""}
worldName: ${input.structuredIntent?.worldName ?? ""}
targetChapterCount: ${input.structuredIntent?.targetChapterCount ?? ""}
genre: ${input.structuredIntent?.genre ?? ""}
worldType: ${input.structuredIntent?.worldType ?? ""}
styleTone: ${input.structuredIntent?.styleTone ?? ""}
projectMode: ${input.structuredIntent?.projectMode ?? ""}
pacePreference: ${input.structuredIntent?.pacePreference ?? ""}
narrativePov: ${input.structuredIntent?.narrativePov ?? ""}
emotionIntensity: ${input.structuredIntent?.emotionIntensity ?? ""}
aiFreedom: ${input.structuredIntent?.aiFreedom ?? ""}
defaultChapterLength: ${input.structuredIntent?.defaultChapterLength ?? ""}

## 用户输入
${conversation}

请生成动态执行计划。`;
}

export const dynamicPlannerPrompt: PromptAsset<DynamicPlannerPromptInput, DynamicWorkflowPlan, Record<string, unknown>> = {
  id: "planner.dynamic.v1",
  version: "v1",
  taskType: "planner",
  mode: "structured",
  language: "zh",
  contextPolicy: {
    maxTokensBudget: 0,
  },
  outputSchema: z
    .record(z.string(), z.unknown())
    .refine((value) => !Array.isArray(value), { message: "Expected JSON object." }),
  render: (input) => {
    const toolCatalog = buildPlannerToolCatalog();
    return [
      new SystemMessage(buildSystemPrompt(toolCatalog)),
      new HumanMessage(buildUserPrompt(input)),
    ];
  },
  postValidate: (output, _input) => {
    const result = outputSchema.safeParse(output);
    if (!result.success) {
      throw new Error(`动态计划校验失败: ${result.error.issues.map((i) => i.message).join("; ")}`);
    }
    const { goal, phases } = result.data;
    const now = new Date().toISOString();
    const dynamicPlan: DynamicWorkflowPlan = {
      id: `dynplan_${Date.now()}`,
      goal,
      version: 1,
      status: "active",
      phases: phases.map((phase, pi) => ({
        id: `phase-${pi}`,
        objective: phase.objective,
        candidateSteps: phase.candidateSteps.map((step, si) => ({
          toolName: step.toolName,
          reasoning: step.reasoning,
          input: step.input,
          idempotencyKey: `dyn_phase${pi}_step${si}_${step.toolName}`,
          expectedOutput: step.expectedOutput,
          isWrite: step.isWrite,
          approvalRequired: step.approvalRequired,
          resourceRequirements: {},
          status: "pending" as const,
        })),
        status: "pending" as const,
      })),
      currentPhaseIndex: 0,
      currentStepPointer: { phaseIndex: 0, stepIndex: 0 },
      createdAt: now,
      updatedAt: now,
      replanHistory: [],
      consecutiveReplanCount: 0,
    };
    return dynamicPlan;
  },
};

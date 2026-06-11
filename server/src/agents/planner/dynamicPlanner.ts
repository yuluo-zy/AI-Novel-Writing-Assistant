import type { DynamicWorkflowPlan } from "@ai-novel/shared/types/dynamicPlan";
import type { PlannerInput, StructuredIntent } from "../types";
import { runStructuredPrompt } from "../../prompting/core/promptRunner";
import { dynamicPlannerPrompt } from "../../prompting/prompts/agent/dynamicPlanner.prompt";

export async function generateDynamicPlan(
  intent: StructuredIntent,
  input: PlannerInput,
): Promise<DynamicWorkflowPlan> {
  const result = await runStructuredPrompt({
    asset: dynamicPlannerPrompt,
    promptInput: {
      ...input,
      structuredIntent: intent,
    },
    options: {
      provider: input.provider,
      model: input.model,
      temperature: typeof input.temperature === "number" ? Math.min(input.temperature, 0.2) : 0.15,
      maxTokens: input.maxTokens,
    },
  });
  return result.output;
}

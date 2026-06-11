import type { PlannerInput, PlannerResult } from "./types";
import { compileIntentToPlan, toPlannedActions } from "./planner/compiler";
import { parseIntentWithLLM } from "./planner/parser";
import { generateDynamicPlan } from "./planner/dynamicPlanner";
import { validateDynamicPlan } from "./planner/planValidator";

export async function createStructuredPlan(input: PlannerInput): Promise<PlannerResult> {
  const structuredIntent = await parseIntentWithLLM(input);

  const useDynamic = structuredIntent.intent === "produce_novel";
  const validationWarnings = structuredIntent.confidence < 0.3
    ? ["LLM intent confidence is low."]
    : [];

  if (useDynamic) {
    try {
      const dynamicPlan = await generateDynamicPlan(structuredIntent, input);
      const validated = validateDynamicPlan(dynamicPlan);
      if (validated.valid) {
        const staticPlan = compileIntentToPlan(structuredIntent, input);
        return {
          structuredIntent,
          plan: staticPlan,
          actions: [],
          source: "llm_dynamic",
          validationWarnings,
          dynamicPlan,
        };
      }
      validationWarnings.push(...validated.errors);
    } catch {
      // Fall through to static
    }
  }

  const compiledPlan = compileIntentToPlan(structuredIntent, input);
  const actions = toPlannedActions(compiledPlan);
  return {
    structuredIntent,
    plan: compiledPlan,
    actions,
    source: "llm",
    validationWarnings,
  };
}

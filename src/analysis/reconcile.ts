/** Reconcile top-down and bottom-up TAM estimates. */

import type { LLMClient } from "../llm/client.js";
import { reconcileTamPrompt, SYSTEM_PROMPT } from "../llm/prompts.js";
import { MarketEstimateSchema, type MarketEstimate } from "../models.js";
import { formatUsd } from "../util/format.js";

export async function reconcileTam(
  llm: LLMClient,
  companyName: string,
  geography: string,
  topDown: MarketEstimate,
  bottomUp: MarketEstimate,
): Promise<MarketEstimate> {
  const prompt = reconcileTamPrompt({
    name: companyName,
    geography,
    top_down_value: formatUsd(topDown.value_usd),
    top_down_confidence: topDown.confidence,
    top_down_method: topDown.method,
    top_down_assumptions: topDown.assumptions.map((a) => `  - ${a}`).join("\n"),
    bottom_up_value: formatUsd(bottomUp.value_usd),
    bottom_up_confidence: bottomUp.confidence,
    bottom_up_method: bottomUp.method,
    bottom_up_assumptions: bottomUp.assumptions
      .map((a) => `  - ${a}`)
      .join("\n"),
  });

  return llm.structuredQuery(
    prompt,
    MarketEstimateSchema,
    "MarketEstimate",
    SYSTEM_PROMPT,
  );
}

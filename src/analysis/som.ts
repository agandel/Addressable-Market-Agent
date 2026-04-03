/** SOM (Serviceable Obtainable Market) estimation. */

import type { LLMClient } from "../llm/client.js";
import { somEstimationPrompt, SYSTEM_PROMPT } from "../llm/prompts.js";
import {
  SOMEstimateSchema,
  type CompanyInput,
  type CompetitiveLandscape,
  type MarketEstimate,
  type SOMEstimate,
} from "../models.js";
import { formatUsd } from "../util/format.js";

export async function estimateSom(
  llm: LLMClient,
  company: CompanyInput,
  tamConsensus: MarketEstimate,
  competitive: CompetitiveLandscape,
): Promise<SOMEstimate> {
  const revenueSection = company.revenue_usd
    ? `Current estimated revenue: ${formatUsd(company.revenue_usd)}`
    : "Current revenue: Not provided";

  const competitorSummary =
    competitive.top_competitors
      .slice(0, 5)
      .map((c) =>
        c.market_share_pct
          ? `${c.name} (${c.market_share_pct.toFixed(1)}% share)`
          : c.name,
      )
      .join(", ") || "Unknown";

  const prompt = somEstimationPrompt({
    name: company.name,
    industry:
      company.products_services[0] ?? company.industry,
    geography: company.geography,
    products_services: company.products_services.join(", "),
    revenue_section: revenueSection,
    tam_value: formatUsd(tamConsensus.value_usd),
    market_concentration: competitive.market_concentration,
    competitor_summary: competitorSummary,
    total_competitors: competitive.total_competitors_estimated,
  });

  return llm.structuredQuery(
    prompt,
    SOMEstimateSchema,
    "SOMEstimate",
    SYSTEM_PROMPT,
  );
}

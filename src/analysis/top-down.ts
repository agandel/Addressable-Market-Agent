/** Top-down TAM estimation. */

import type { LLMClient } from "../llm/client.js";
import { topDownTamPrompt, SYSTEM_PROMPT } from "../llm/prompts.js";
import {
  MarketEstimateSchema,
  type CompanyInput,
  type IndustryClassification,
  type MarketDataPoint,
  type MarketEstimate,
  type SearchResult,
} from "../models.js";
import { extractMarketData, formatSearchDataSection } from "../research/data-extraction.js";
import type { WebSearcher } from "../research/web-search.js";

export async function estimateTopDown(
  llm: LLMClient,
  searcher: WebSearcher,
  company: CompanyInput,
  industry: IndustryClassification,
): Promise<{
  estimate: MarketEstimate;
  searchResults: SearchResult[];
  dataPoints: MarketDataPoint[];
}> {
  const context =
    `Company: ${company.name}, Industry: ${company.industry} ` +
    `(NAICS ${industry.naics_code}: ${industry.naics_description}), ` +
    `Geography: ${company.geography}, Sub-segments: ${industry.sub_segments.join(", ")}`;

  const queries = await llm.generateSearchQueries(
    `Find total market size data for top-down TAM estimation.\n${context}`,
    4,
  );

  const searchResults = await searcher.multiSearch(queries);
  const dataPoints = await extractMarketData(llm, searchResults, context);
  const searchDataSection = formatSearchDataSection(searchResults, dataPoints);

  const estimate = await llm.structuredQuery(
    topDownTamPrompt({
      name: company.name,
      industry: company.industry,
      naics_code: industry.naics_code,
      naics_description: industry.naics_description,
      geography: company.geography,
      sub_segments: industry.sub_segments.join(", "),
      search_data_section: searchDataSection,
    }),
    MarketEstimateSchema,
    "MarketEstimate",
    SYSTEM_PROMPT,
  );

  return { estimate, searchResults, dataPoints };
}

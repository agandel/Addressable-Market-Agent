/** Competitive landscape analysis. */

import type { LLMClient } from "../llm/client.js";
import { competitiveLandscapePrompt, SYSTEM_PROMPT } from "../llm/prompts.js";
import {
  CompetitiveLandscapeSchema,
  type CompanyInput,
  type CompetitiveLandscape,
  type IndustryClassification,
  type MarketDataPoint,
  type SearchResult,
} from "../models.js";
import { extractMarketData, formatSearchDataSection } from "../research/data-extraction.js";
import type { WebSearcher } from "../research/web-search.js";

export async function analyzeCompetitiveLandscape(
  llm: LLMClient,
  searcher: WebSearcher,
  company: CompanyInput,
  industry: IndustryClassification,
): Promise<{
  landscape: CompetitiveLandscape;
  searchResults: SearchResult[];
  dataPoints: MarketDataPoint[];
}> {
  const context =
    `Competitors of ${company.name} in ${company.industry}, ` +
    `NAICS ${industry.naics_code}, Geography: ${company.geography}`;

  const queries = await llm.generateSearchQueries(
    `Find top competitors, their revenues, and market share data.\n${context}`,
    4,
  );

  const searchResults = await searcher.multiSearch(queries);
  const dataPoints = await extractMarketData(llm, searchResults, context);
  const searchDataSection = formatSearchDataSection(searchResults, dataPoints);

  const landscape = await llm.structuredQuery(
    competitiveLandscapePrompt({
      name: company.name,
      industry: company.industry,
      naics_code: industry.naics_code,
      geography: company.geography,
      sub_segments: industry.sub_segments.join(", "),
      search_data_section: searchDataSection,
    }),
    CompetitiveLandscapeSchema,
    "CompetitiveLandscape",
    SYSTEM_PROMPT,
  );

  return { landscape, searchResults, dataPoints };
}

/** Extract structured market data from search results using LLM. */

import { z } from "zod";
import type { LLMClient } from "../llm/client.js";
import { MarketDataPointSchema, type MarketDataPoint, type SearchResult } from "../models.js";

const ExtractedDataSchema = z.object({
  data_points: z.array(MarketDataPointSchema).default([]),
});

export async function extractMarketData(
  llm: LLMClient,
  searchResults: SearchResult[],
  context: string,
): Promise<MarketDataPoint[]> {
  if (searchResults.length === 0) return [];

  const snippetsText = searchResults
    .map((r) => `Source: ${r.title} (${r.url})\n${r.snippet}`)
    .join("\n\n");

  const prompt =
    `Extract quantitative market data points from the following search results.\n\n` +
    `Context: ${context}\n\n` +
    `Search Results:\n${snippetsText}\n\n` +
    `For each data point, identify:\n` +
    `- The metric being measured (e.g., 'global cybersecurity market size')\n` +
    `- The value (e.g., '$180 billion')\n` +
    `- The reference year if mentioned\n` +
    `- The source URL and name\n` +
    `- Reliability: 'official_report' for industry reports/government data, ` +
    `'news_article' for news/press, 'estimate' for analyst/blog estimates\n\n` +
    `Only extract data points with concrete numerical values. If no quantitative ` +
    `data is found, return an empty list.`;

  const result = await llm.structuredQuery(
    prompt,
    ExtractedDataSchema,
    "ExtractedData",
    "You are a data extraction specialist. Extract only factual numerical data.",
  );
  return result.data_points ?? [];
}

export function formatSearchDataSection(
  searchResults: SearchResult[],
  dataPoints: MarketDataPoint[],
): string {
  if (searchResults.length === 0 && dataPoints.length === 0) {
    return (
      "Note: No web search data was available. Base your estimates on your " +
      "training knowledge, and rate confidence lower accordingly."
    );
  }

  const parts: string[] = [];

  if (dataPoints.length > 0) {
    parts.push("Extracted Market Data Points:");
    for (const dp of dataPoints) {
      const yearStr = dp.year ? ` (${dp.year})` : "";
      parts.push(
        `  - ${dp.metric}: ${dp.value}${yearStr} [Source: ${dp.source_name}]`,
      );
    }
  }

  if (searchResults.length > 0) {
    parts.push("\nRaw Search Snippets:");
    for (const r of searchResults.slice(0, 10)) {
      parts.push(`  - ${r.title}: ${r.snippet.slice(0, 200)}`);
    }
  }

  return parts.join("\n");
}

/** Data models for the TAM/SOM assessment pipeline. */

import { z } from "zod";

export const CompanyInputSchema = z.object({
  name: z.string().describe("Company name"),
  industry: z.string().describe("Industry or sector"),
  geography: z
    .string()
    .describe("Primary operating geography (e.g. 'US', 'Europe', 'Global')"),
  products_services: z
    .array(z.string())
    .describe("Key products or services offered"),
  revenue_usd: z
    .number()
    .nullable()
    .optional()
    .describe("Annual revenue in USD if known"),
  description: z
    .string()
    .nullable()
    .optional()
    .describe("Additional company description"),
});
export type CompanyInput = z.infer<typeof CompanyInputSchema>;

export const IndustryClassificationSchema = z.object({
  naics_code: z.string().describe("NAICS code"),
  naics_description: z.string().describe("NAICS industry description"),
  sic_code: z
    .string()
    .nullable()
    .optional()
    .describe("SIC code if applicable"),
  sub_segments: z
    .array(z.string())
    .describe("Relevant market sub-segments"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score"),
});
export type IndustryClassification = z.infer<
  typeof IndustryClassificationSchema
>;

export const MarketEstimateSchema = z.object({
  value_usd: z.number().describe("Market size estimate in USD"),
  year: z.number().describe("Reference year for the estimate"),
  method: z
    .string()
    .describe("Estimation method used (top_down, bottom_up, consensus)"),
  assumptions: z.array(z.string()).describe("Key assumptions made"),
  data_sources: z
    .array(z.string())
    .describe("Sources used for the estimate"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score"),
});
export type MarketEstimate = z.infer<typeof MarketEstimateSchema>;

export const CompetitorSchema = z.object({
  name: z.string().describe("Competitor name"),
  estimated_revenue_usd: z
    .number()
    .nullable()
    .optional()
    .describe("Estimated revenue in USD"),
  market_share_pct: z
    .number()
    .nullable()
    .optional()
    .describe("Estimated market share percentage"),
  source: z
    .string()
    .nullable()
    .optional()
    .describe("Source for the data"),
});
export type Competitor = z.infer<typeof CompetitorSchema>;

export const CompetitiveLandscapeSchema = z.object({
  total_competitors_estimated: z
    .number()
    .describe("Estimated total number of competitors"),
  top_competitors: z
    .array(CompetitorSchema)
    .describe("Top competitors with details"),
  market_concentration: z
    .string()
    .describe("Market concentration: fragmented, moderate, or concentrated"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score"),
});
export type CompetitiveLandscape = z.infer<typeof CompetitiveLandscapeSchema>;

export const SOMEstimateSchema = z.object({
  value_usd: z.number().describe("SOM estimate in USD"),
  market_share_pct: z
    .number()
    .describe("Estimated obtainable market share percentage"),
  methodology: z.string().describe("How the SOM was calculated"),
  assumptions: z.array(z.string()).describe("Key assumptions"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score"),
});
export type SOMEstimate = z.infer<typeof SOMEstimateSchema>;

export const SearchResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  snippet: z.string(),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;

export const MarketDataPointSchema = z.object({
  metric: z.string().describe("What is being measured"),
  value: z.string().describe("The value (e.g. '$4.2 billion')"),
  year: z.number().nullable().optional().describe("Reference year"),
  source_url: z.string().describe("Source URL"),
  source_name: z.string().describe("Source name"),
  reliability: z
    .string()
    .describe(
      "Reliability: official_report, news_article, or estimate",
    ),
});
export type MarketDataPoint = z.infer<typeof MarketDataPointSchema>;

export interface FinalReport {
  company: CompanyInput;
  industry: IndustryClassification;
  tam_top_down: MarketEstimate;
  tam_bottom_up: MarketEstimate;
  tam_consensus: MarketEstimate;
  competitive_landscape: CompetitiveLandscape;
  som: SOMEstimate;
  methodology_notes: string;
  generated_at: string;
}

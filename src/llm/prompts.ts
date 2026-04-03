/** Prompt templates for each analysis step. */

export const SYSTEM_PROMPT =
  "You are an expert market analyst specializing in TAM (Total Addressable Market) " +
  "and SOM (Serviceable Obtainable Market) estimation. You apply rigorous analytical " +
  "frameworks, clearly state your assumptions, cite data sources, and provide realistic " +
  "confidence levels. When data is uncertain, you say so rather than guessing.";

export function industryClassificationPrompt(vars: {
  name: string;
  industry: string;
  geography: string;
  products_services: string;
  description_section: string;
}): string {
  return `Classify the following company into the most specific applicable NAICS and SIC codes.
Also identify 2-5 relevant market sub-segments the company operates in.

Company: ${vars.name}
Industry: ${vars.industry}
Geography: ${vars.geography}
Products/Services: ${vars.products_services}
${vars.description_section}

Provide the most specific NAICS code (6-digit preferred), its description, an optional
SIC code, and the relevant sub-segments. Rate your confidence from 0.0 to 1.0.`;
}

export function topDownTamPrompt(vars: {
  name: string;
  industry: string;
  naics_code: string;
  naics_description: string;
  geography: string;
  sub_segments: string;
  search_data_section: string;
}): string {
  return `Estimate the Total Addressable Market (TAM) using a top-down approach for the following:

Company: ${vars.name}
Industry: ${vars.industry} (NAICS: ${vars.naics_code} - ${vars.naics_description})
Geography: ${vars.geography}
Sub-segments: ${vars.sub_segments}

${vars.search_data_section}

Instructions:
1. Start from the broadest credible industry market size figure.
2. Narrow down to the specific geography and sub-segments relevant to this company.
3. Use the most recent data available (reference year).
4. Clearly list all assumptions (e.g., "assuming the ${vars.geography} represents X% of the global market").
5. Cite the data sources you relied on.
6. Provide a confidence score (0.0-1.0) — lower if data is sparse or conflicting.

The TAM should represent the total revenue opportunity if the company captured 100%
of its addressable market.`;
}

export function bottomUpTamPrompt(vars: {
  name: string;
  industry: string;
  naics_code: string;
  naics_description: string;
  geography: string;
  products_services: string;
  search_data_section: string;
}): string {
  return `Estimate the Total Addressable Market (TAM) using a bottom-up approach for the following:

Company: ${vars.name}
Industry: ${vars.industry} (NAICS: ${vars.naics_code} - ${vars.naics_description})
Geography: ${vars.geography}
Products/Services: ${vars.products_services}

${vars.search_data_section}

Instructions:
1. Identify the target customer segments (e.g., enterprises, SMBs, consumers).
2. Estimate the number of potential customers in the geography.
3. Estimate average annual revenue per customer (ARPC) based on typical pricing in this industry.
4. TAM = Number of potential customers × ARPC.
5. Clearly state each assumption with reasoning.
6. Cite sources used for customer counts or pricing data.
7. Provide a confidence score (0.0-1.0).`;
}

export function reconcileTamPrompt(vars: {
  name: string;
  geography: string;
  top_down_value: string;
  top_down_confidence: number;
  top_down_method: string;
  top_down_assumptions: string;
  bottom_up_value: string;
  bottom_up_confidence: number;
  bottom_up_method: string;
  bottom_up_assumptions: string;
}): string {
  return `You have two TAM estimates for ${vars.name} in ${vars.geography}:

Top-Down Estimate: $${vars.top_down_value} (confidence: ${vars.top_down_confidence})
Method: ${vars.top_down_method}
Assumptions: ${vars.top_down_assumptions}

Bottom-Up Estimate: $${vars.bottom_up_value} (confidence: ${vars.bottom_up_confidence})
Method: ${vars.bottom_up_method}
Assumptions: ${vars.bottom_up_assumptions}

Instructions:
1. Analyze why the two estimates differ.
2. Determine which estimate is more reliable and why.
3. Produce a consensus TAM estimate — this can be a weighted average, one of the two,
   or an adjusted figure with justification.
4. List the consolidated assumptions.
5. Cite all sources from both estimates.
6. Provide a final confidence score.`;
}

export function competitiveLandscapePrompt(vars: {
  name: string;
  industry: string;
  naics_code: string;
  geography: string;
  sub_segments: string;
  search_data_section: string;
}): string {
  return `Analyze the competitive landscape for:

Company: ${vars.name}
Industry: ${vars.industry} (NAICS: ${vars.naics_code})
Geography: ${vars.geography}
Sub-segments: ${vars.sub_segments}

${vars.search_data_section}

Instructions:
1. Identify the top 5-10 competitors in this market and geography.
2. For each competitor, estimate revenue (in USD) and market share if data is available.
3. Assess the overall market concentration (fragmented, moderate, or concentrated).
4. Estimate the total number of meaningful competitors in this space.
5. Cite your sources.
6. Rate your confidence (0.0-1.0).`;
}

export function somEstimationPrompt(vars: {
  name: string;
  industry: string;
  geography: string;
  products_services: string;
  revenue_section: string;
  tam_value: string;
  market_concentration: string;
  competitor_summary: string;
  total_competitors: number;
}): string {
  return `Estimate the Serviceable Obtainable Market (SOM) for:

Company: ${vars.name}
Industry: ${vars.industry}
Geography: ${vars.geography}
Products/Services: ${vars.products_services}
${vars.revenue_section}

Market Context:
- Consensus TAM: $${vars.tam_value}
- Market concentration: ${vars.market_concentration}
- Top competitors: ${vars.competitor_summary}
- Total competitors estimated: ${vars.total_competitors}

Instructions:
1. SOM represents the realistic portion of TAM the company can capture in the
   near-to-medium term (3-5 years).
2. Consider the company's:
   - Current market position and revenue (if known)
   - Geographic reach vs. total addressable geography
   - Product/service breadth vs. total market scope
   - Competitive positioning and differentiation potential
   - Barriers to entry and switching costs
3. Estimate a realistic market share percentage and calculate SOM = TAM × share%.
4. Clearly explain your methodology and reasoning.
5. List key assumptions.
6. Rate your confidence (0.0-1.0).`;
}

export function methodologySummaryPrompt(vars: {
  name: string;
  industry: string;
  naics_code: string;
  geography: string;
  tam_td: string;
  td_conf: string;
  tam_bu: string;
  bu_conf: string;
  tam_consensus: string;
  consensus_conf: string;
  som: string;
  som_share: string;
  som_conf: string;
  num_competitors: number;
  concentration: string;
}): string {
  return `Write a concise methodology summary (2-3 paragraphs) for a TAM/SOM assessment of ${vars.name}.

Analysis Overview:
- Industry: ${vars.industry} (${vars.naics_code})
- Geography: ${vars.geography}
- TAM (top-down): $${vars.tam_td} (confidence: ${vars.td_conf})
- TAM (bottom-up): $${vars.tam_bu} (confidence: ${vars.bu_conf})
- TAM (consensus): $${vars.tam_consensus} (confidence: ${vars.consensus_conf})
- SOM: $${vars.som} (${vars.som_share}% share, confidence: ${vars.som_conf})
- Competitors analyzed: ${vars.num_competitors}
- Market concentration: ${vars.concentration}

Summarize the methodology used, key data sources, major assumptions, and the most
important caveats the reader should be aware of. Be honest about limitations.`;
}

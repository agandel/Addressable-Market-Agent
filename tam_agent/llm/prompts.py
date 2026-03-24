"""Prompt templates for each analysis step."""

SYSTEM_PROMPT = (
    "You are an expert market analyst specializing in TAM (Total Addressable Market) "
    "and SOM (Serviceable Obtainable Market) estimation. You apply rigorous analytical "
    "frameworks, clearly state your assumptions, cite data sources, and provide realistic "
    "confidence levels. When data is uncertain, you say so rather than guessing."
)

INDUSTRY_CLASSIFICATION = """\
Classify the following company into the most specific applicable NAICS and SIC codes.
Also identify 2-5 relevant market sub-segments the company operates in.

Company: {name}
Industry: {industry}
Geography: {geography}
Products/Services: {products_services}
{description_section}

Provide the most specific NAICS code (6-digit preferred), its description, an optional
SIC code, and the relevant sub-segments. Rate your confidence from 0.0 to 1.0.
"""

TOP_DOWN_TAM = """\
Estimate the Total Addressable Market (TAM) using a top-down approach for the following:

Company: {name}
Industry: {industry} (NAICS: {naics_code} - {naics_description})
Geography: {geography}
Sub-segments: {sub_segments}

{search_data_section}

Instructions:
1. Start from the broadest credible industry market size figure.
2. Narrow down to the specific geography and sub-segments relevant to this company.
3. Use the most recent data available (reference year).
4. Clearly list all assumptions (e.g., "assuming the {geography} represents X% of the global market").
5. Cite the data sources you relied on.
6. Provide a confidence score (0.0-1.0) — lower if data is sparse or conflicting.

The TAM should represent the total revenue opportunity if the company captured 100%
of its addressable market.
"""

BOTTOM_UP_TAM = """\
Estimate the Total Addressable Market (TAM) using a bottom-up approach for the following:

Company: {name}
Industry: {industry} (NAICS: {naics_code} - {naics_description})
Geography: {geography}
Products/Services: {products_services}

{search_data_section}

Instructions:
1. Identify the target customer segments (e.g., enterprises, SMBs, consumers).
2. Estimate the number of potential customers in the geography.
3. Estimate average annual revenue per customer (ARPC) based on typical pricing in this industry.
4. TAM = Number of potential customers × ARPC.
5. Clearly state each assumption with reasoning.
6. Cite sources used for customer counts or pricing data.
7. Provide a confidence score (0.0-1.0).
"""

RECONCILE_TAM = """\
You have two TAM estimates for {name} in {geography}:

Top-Down Estimate: ${top_down_value:,.0f} (confidence: {top_down_confidence})
Method: {top_down_method}
Assumptions: {top_down_assumptions}

Bottom-Up Estimate: ${bottom_up_value:,.0f} (confidence: {bottom_up_confidence})
Method: {bottom_up_method}
Assumptions: {bottom_up_assumptions}

Instructions:
1. Analyze why the two estimates differ.
2. Determine which estimate is more reliable and why.
3. Produce a consensus TAM estimate — this can be a weighted average, one of the two,
   or an adjusted figure with justification.
4. List the consolidated assumptions.
5. Cite all sources from both estimates.
6. Provide a final confidence score.
"""

COMPETITIVE_LANDSCAPE = """\
Analyze the competitive landscape for:

Company: {name}
Industry: {industry} (NAICS: {naics_code})
Geography: {geography}
Sub-segments: {sub_segments}

{search_data_section}

Instructions:
1. Identify the top 5-10 competitors in this market and geography.
2. For each competitor, estimate revenue (in USD) and market share if data is available.
3. Assess the overall market concentration (fragmented, moderate, or concentrated).
4. Estimate the total number of meaningful competitors in this space.
5. Cite your sources.
6. Rate your confidence (0.0-1.0).
"""

SOM_ESTIMATION = """\
Estimate the Serviceable Obtainable Market (SOM) for:

Company: {name}
Industry: {industry}
Geography: {geography}
Products/Services: {products_services}
{revenue_section}

Market Context:
- Consensus TAM: ${tam_value:,.0f}
- Market concentration: {market_concentration}
- Top competitors: {competitor_summary}
- Total competitors estimated: {total_competitors}

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
6. Rate your confidence (0.0-1.0).
"""

METHODOLOGY_SUMMARY = """\
Write a concise methodology summary (2-3 paragraphs) for a TAM/SOM assessment of {name}.

Analysis Overview:
- Industry: {industry} ({naics_code})
- Geography: {geography}
- TAM (top-down): ${tam_td:,.0f} (confidence: {td_conf})
- TAM (bottom-up): ${tam_bu:,.0f} (confidence: {bu_conf})
- TAM (consensus): ${tam_consensus:,.0f} (confidence: {consensus_conf})
- SOM: ${som:,.0f} ({som_share:.1f}% share, confidence: {som_conf})
- Competitors analyzed: {num_competitors}
- Market concentration: {concentration}

Summarize the methodology used, key data sources, major assumptions, and the most
important caveats the reader should be aware of. Be honest about limitations.
"""

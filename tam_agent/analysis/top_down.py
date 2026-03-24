"""Top-down TAM estimation."""

from __future__ import annotations

from tam_agent.llm.client import LLMClient
from tam_agent.llm.prompts import SYSTEM_PROMPT, TOP_DOWN_TAM
from tam_agent.models import (
    CompanyInput,
    IndustryClassification,
    MarketDataPoint,
    MarketEstimate,
    SearchResult,
)
from tam_agent.research.data_extraction import extract_market_data, format_search_data_section
from tam_agent.research.web_search import WebSearcher


def estimate_top_down(
    llm: LLMClient,
    searcher: WebSearcher,
    company: CompanyInput,
    industry: IndustryClassification,
) -> tuple[MarketEstimate, list[SearchResult], list[MarketDataPoint]]:
    """Estimate TAM using top-down approach (industry reports -> narrow down)."""

    # Generate search queries
    context = (
        f"Company: {company.name}, Industry: {company.industry} "
        f"(NAICS {industry.naics_code}: {industry.naics_description}), "
        f"Geography: {company.geography}, Sub-segments: {', '.join(industry.sub_segments)}"
    )
    queries = llm.generate_search_queries(
        f"Find total market size data for top-down TAM estimation.\n{context}",
        num_queries=4,
    )

    # Search and extract data
    search_results = searcher.multi_search(queries)
    data_points = extract_market_data(llm, search_results, context)
    search_data_section = format_search_data_section(search_results, data_points)

    # Estimate
    prompt = TOP_DOWN_TAM.format(
        name=company.name,
        industry=company.industry,
        naics_code=industry.naics_code,
        naics_description=industry.naics_description,
        geography=company.geography,
        sub_segments=", ".join(industry.sub_segments),
        search_data_section=search_data_section,
    )

    estimate = llm.structured_query(
        prompt=prompt,
        response_model=MarketEstimate,
        system=SYSTEM_PROMPT,
    )
    return estimate, search_results, data_points

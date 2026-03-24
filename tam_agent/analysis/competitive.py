"""Competitive landscape analysis."""

from __future__ import annotations

from tam_agent.llm.client import LLMClient
from tam_agent.llm.prompts import COMPETITIVE_LANDSCAPE, SYSTEM_PROMPT
from tam_agent.models import (
    CompanyInput,
    CompetitiveLandscape,
    IndustryClassification,
    MarketDataPoint,
    SearchResult,
)
from tam_agent.research.data_extraction import extract_market_data, format_search_data_section
from tam_agent.research.web_search import WebSearcher


def analyze_competitive_landscape(
    llm: LLMClient,
    searcher: WebSearcher,
    company: CompanyInput,
    industry: IndustryClassification,
) -> tuple[CompetitiveLandscape, list[SearchResult], list[MarketDataPoint]]:
    """Analyze the competitive landscape for a company's market."""

    context = (
        f"Competitors of {company.name} in {company.industry}, "
        f"NAICS {industry.naics_code}, Geography: {company.geography}"
    )
    queries = llm.generate_search_queries(
        f"Find top competitors, their revenues, and market share data.\n{context}",
        num_queries=4,
    )

    search_results = searcher.multi_search(queries)
    data_points = extract_market_data(llm, search_results, context)
    search_data_section = format_search_data_section(search_results, data_points)

    prompt = COMPETITIVE_LANDSCAPE.format(
        name=company.name,
        industry=company.industry,
        naics_code=industry.naics_code,
        geography=company.geography,
        sub_segments=", ".join(industry.sub_segments),
        search_data_section=search_data_section,
    )

    landscape = llm.structured_query(
        prompt=prompt,
        response_model=CompetitiveLandscape,
        system=SYSTEM_PROMPT,
    )
    return landscape, search_results, data_points

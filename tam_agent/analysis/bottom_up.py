"""Bottom-up TAM estimation."""

from __future__ import annotations

from tam_agent.llm.client import LLMClient
from tam_agent.llm.prompts import BOTTOM_UP_TAM, SYSTEM_PROMPT
from tam_agent.models import (
    CompanyInput,
    IndustryClassification,
    MarketDataPoint,
    MarketEstimate,
    SearchResult,
)
from tam_agent.research.data_extraction import extract_market_data, format_search_data_section
from tam_agent.research.web_search import WebSearcher


def estimate_bottom_up(
    llm: LLMClient,
    searcher: WebSearcher,
    company: CompanyInput,
    industry: IndustryClassification,
) -> tuple[MarketEstimate, list[SearchResult], list[MarketDataPoint]]:
    """Estimate TAM using bottom-up approach (customers x ARPC)."""

    context = (
        f"Company: {company.name}, Products: {', '.join(company.products_services)}, "
        f"Industry: {company.industry}, Geography: {company.geography}"
    )
    queries = llm.generate_search_queries(
        f"Find customer count, pricing, and ARPC data for bottom-up TAM estimation.\n{context}",
        num_queries=4,
    )

    search_results = searcher.multi_search(queries)
    data_points = extract_market_data(llm, search_results, context)
    search_data_section = format_search_data_section(search_results, data_points)

    prompt = BOTTOM_UP_TAM.format(
        name=company.name,
        industry=company.industry,
        naics_code=industry.naics_code,
        naics_description=industry.naics_description,
        geography=company.geography,
        products_services=", ".join(company.products_services),
        search_data_section=search_data_section,
    )

    estimate = llm.structured_query(
        prompt=prompt,
        response_model=MarketEstimate,
        system=SYSTEM_PROMPT,
    )
    return estimate, search_results, data_points

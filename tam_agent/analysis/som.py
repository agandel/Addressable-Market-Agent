"""SOM (Serviceable Obtainable Market) estimation."""

from __future__ import annotations

from tam_agent.llm.client import LLMClient
from tam_agent.llm.prompts import SOM_ESTIMATION, SYSTEM_PROMPT
from tam_agent.models import (
    CompanyInput,
    CompetitiveLandscape,
    MarketEstimate,
    SOMEstimate,
)


def estimate_som(
    llm: LLMClient,
    company: CompanyInput,
    tam_consensus: MarketEstimate,
    competitive: CompetitiveLandscape,
) -> SOMEstimate:
    """Estimate the Serviceable Obtainable Market."""

    revenue_section = (
        f"Current estimated revenue: ${company.revenue_usd:,.0f}"
        if company.revenue_usd
        else "Current revenue: Not provided"
    )

    competitor_summary = ", ".join(
        f"{c.name} ({c.market_share_pct:.1f}% share)" if c.market_share_pct
        else c.name
        for c in competitive.top_competitors[:5]
    )

    prompt = SOM_ESTIMATION.format(
        name=company.name,
        industry=company.products_services[0] if company.products_services else company.industry,
        geography=company.geography,
        products_services=", ".join(company.products_services),
        revenue_section=revenue_section,
        tam_value=tam_consensus.value_usd,
        market_concentration=competitive.market_concentration,
        competitor_summary=competitor_summary or "Unknown",
        total_competitors=competitive.total_competitors_estimated,
    )

    return llm.structured_query(
        prompt=prompt,
        response_model=SOMEstimate,
        system=SYSTEM_PROMPT,
    )

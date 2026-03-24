"""Test fixtures."""

import pytest

from tam_agent.models import (
    CompanyInput,
    Competitor,
    CompetitiveLandscape,
    IndustryClassification,
    MarketEstimate,
    SOMEstimate,
)


@pytest.fixture
def sample_company() -> CompanyInput:
    return CompanyInput(
        name="Acme Cyber",
        industry="Cybersecurity",
        geography="North America",
        products_services=["endpoint detection", "SIEM", "threat intelligence"],
        revenue_usd=50_000_000,
        description="Mid-market cybersecurity company.",
    )


@pytest.fixture
def sample_industry() -> IndustryClassification:
    return IndustryClassification(
        naics_code="541512",
        naics_description="Computer Systems Design Services",
        sic_code="7372",
        sub_segments=["Endpoint Security", "SIEM", "Threat Intelligence"],
        confidence=0.85,
    )


@pytest.fixture
def sample_market_estimate() -> MarketEstimate:
    return MarketEstimate(
        value_usd=180_000_000_000,
        year=2025,
        method="top_down",
        assumptions=["Global cybersecurity market", "NA is 40%"],
        data_sources=["Gartner", "Statista"],
        confidence=0.7,
    )


@pytest.fixture
def sample_competitive_landscape() -> CompetitiveLandscape:
    return CompetitiveLandscape(
        total_competitors_estimated=500,
        top_competitors=[
            Competitor(name="CrowdStrike", estimated_revenue_usd=3_000_000_000, market_share_pct=4.2),
            Competitor(name="Palo Alto Networks", estimated_revenue_usd=6_000_000_000, market_share_pct=8.3),
        ],
        market_concentration="moderate",
        confidence=0.65,
    )


@pytest.fixture
def sample_som() -> SOMEstimate:
    return SOMEstimate(
        value_usd=900_000_000,
        market_share_pct=0.5,
        methodology="Based on current revenue trajectory and competitive position",
        assumptions=["3-5 year growth window", "Maintains current growth rate"],
        confidence=0.5,
    )

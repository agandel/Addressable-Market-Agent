"""Tests for data models."""

import json
from datetime import datetime

from tam_agent.models import (
    CompanyInput,
    Competitor,
    CompetitiveLandscape,
    FinalReport,
    IndustryClassification,
    MarketEstimate,
    SOMEstimate,
    SearchResult,
)


def test_company_input_minimal():
    c = CompanyInput(
        name="Test Co",
        industry="Tech",
        geography="US",
        products_services=["SaaS"],
    )
    assert c.name == "Test Co"
    assert c.revenue_usd is None


def test_company_input_full():
    c = CompanyInput(
        name="Test Co",
        industry="Tech",
        geography="Global",
        products_services=["SaaS", "PaaS"],
        revenue_usd=1_000_000,
        description="A test company",
    )
    assert c.revenue_usd == 1_000_000


def test_industry_classification():
    ic = IndustryClassification(
        naics_code="541512",
        naics_description="Computer Systems Design Services",
        sub_segments=["Cloud", "Security"],
        confidence=0.8,
    )
    assert ic.naics_code == "541512"
    assert len(ic.sub_segments) == 2


def test_market_estimate_serialization():
    me = MarketEstimate(
        value_usd=1e9,
        year=2025,
        method="top_down",
        assumptions=["Assumption 1"],
        data_sources=["Source 1"],
        confidence=0.7,
    )
    data = json.loads(me.model_dump_json())
    assert data["value_usd"] == 1e9
    assert data["method"] == "top_down"


def test_final_report_construction(
    sample_company,
    sample_industry,
    sample_market_estimate,
    sample_competitive_landscape,
    sample_som,
):
    report = FinalReport(
        company=sample_company,
        industry=sample_industry,
        tam_top_down=sample_market_estimate,
        tam_bottom_up=sample_market_estimate,
        tam_consensus=sample_market_estimate,
        competitive_landscape=sample_competitive_landscape,
        som=sample_som,
        methodology_notes="Test methodology.",
    )
    assert report.company.name == "Acme Cyber"
    assert isinstance(report.generated_at, datetime)

    # Verify JSON serialization round-trip
    json_str = report.model_dump_json()
    loaded = FinalReport.model_validate_json(json_str)
    assert loaded.company.name == report.company.name
    assert loaded.tam_consensus.value_usd == report.tam_consensus.value_usd


def test_search_result():
    sr = SearchResult(title="Test", url="https://example.com", snippet="A snippet")
    assert sr.url == "https://example.com"

"""Tests for report formatting."""

from tam_agent.models import FinalReport
from tam_agent.report.builder import to_json, to_markdown


def test_to_markdown(
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
        methodology_notes="Test notes.",
    )
    md = to_markdown(report)
    assert "# TAM/SOM Assessment: Acme Cyber" in md
    assert "Consensus TAM" in md
    assert "CrowdStrike" in md


def test_to_json(
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
        methodology_notes="Test notes.",
    )
    j = to_json(report)
    assert '"Acme Cyber"' in j
    assert '"value_usd"' in j

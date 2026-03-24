"""Reconcile top-down and bottom-up TAM estimates."""

from __future__ import annotations

from tam_agent.llm.client import LLMClient
from tam_agent.llm.prompts import RECONCILE_TAM, SYSTEM_PROMPT
from tam_agent.models import MarketEstimate


def reconcile_tam(
    llm: LLMClient,
    company_name: str,
    geography: str,
    top_down: MarketEstimate,
    bottom_up: MarketEstimate,
) -> MarketEstimate:
    """Produce a consensus TAM from top-down and bottom-up estimates."""

    prompt = RECONCILE_TAM.format(
        name=company_name,
        geography=geography,
        top_down_value=top_down.value_usd,
        top_down_confidence=top_down.confidence,
        top_down_method=top_down.method,
        top_down_assumptions="\n  - ".join(top_down.assumptions),
        bottom_up_value=bottom_up.value_usd,
        bottom_up_confidence=bottom_up.confidence,
        bottom_up_method=bottom_up.method,
        bottom_up_assumptions="\n  - ".join(bottom_up.assumptions),
    )

    return llm.structured_query(
        prompt=prompt,
        response_model=MarketEstimate,
        system=SYSTEM_PROMPT,
    )

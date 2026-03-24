"""Industry classification analysis."""

from __future__ import annotations

from tam_agent.llm.client import LLMClient
from tam_agent.llm.prompts import INDUSTRY_CLASSIFICATION, SYSTEM_PROMPT
from tam_agent.models import CompanyInput, IndustryClassification


def classify_industry(llm: LLMClient, company: CompanyInput) -> IndustryClassification:
    """Classify a company into NAICS/SIC codes and identify sub-segments."""
    description_section = (
        f"Description: {company.description}" if company.description else ""
    )

    prompt = INDUSTRY_CLASSIFICATION.format(
        name=company.name,
        industry=company.industry,
        geography=company.geography,
        products_services=", ".join(company.products_services),
        description_section=description_section,
    )

    return llm.structured_query(
        prompt=prompt,
        response_model=IndustryClassification,
        system=SYSTEM_PROMPT,
    )

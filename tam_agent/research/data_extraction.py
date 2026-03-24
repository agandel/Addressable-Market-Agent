"""Extract structured market data from search results using LLM."""

from __future__ import annotations

from typing import TYPE_CHECKING

from pydantic import BaseModel, Field

from tam_agent.models import MarketDataPoint, SearchResult

if TYPE_CHECKING:
    from tam_agent.llm.client import LLMClient


class ExtractedData(BaseModel):
    """Container for extracted data points."""
    data_points: list[MarketDataPoint] = Field(default_factory=list)


def extract_market_data(
    llm: LLMClient,
    search_results: list[SearchResult],
    context: str,
) -> list[MarketDataPoint]:
    """Extract structured market data from search result snippets."""
    if not search_results:
        return []

    snippets_text = "\n\n".join(
        f"Source: {r.title} ({r.url})\n{r.snippet}"
        for r in search_results
    )

    prompt = (
        f"Extract quantitative market data points from the following search results.\n\n"
        f"Context: {context}\n\n"
        f"Search Results:\n{snippets_text}\n\n"
        f"For each data point, identify:\n"
        f"- The metric being measured (e.g., 'global cybersecurity market size')\n"
        f"- The value (e.g., '$180 billion')\n"
        f"- The reference year if mentioned\n"
        f"- The source URL and name\n"
        f"- Reliability: 'official_report' for industry reports/government data, "
        f"'news_article' for news/press, 'estimate' for analyst/blog estimates\n\n"
        f"Only extract data points with concrete numerical values. If no quantitative "
        f"data is found, return an empty list."
    )

    result = llm.structured_query(
        prompt=prompt,
        response_model=ExtractedData,
        system="You are a data extraction specialist. Extract only factual numerical data.",
    )
    return result.data_points


def format_search_data_section(
    search_results: list[SearchResult],
    data_points: list[MarketDataPoint],
) -> str:
    """Format search data into a text section for prompt injection."""
    if not search_results and not data_points:
        return (
            "Note: No web search data was available. Base your estimates on your "
            "training knowledge, and rate confidence lower accordingly."
        )

    parts: list[str] = []

    if data_points:
        parts.append("Extracted Market Data Points:")
        for dp in data_points:
            year_str = f" ({dp.year})" if dp.year else ""
            parts.append(f"  - {dp.metric}: {dp.value}{year_str} [Source: {dp.source_name}]")

    if search_results:
        parts.append("\nRaw Search Snippets:")
        for r in search_results[:10]:
            parts.append(f"  - {r.title}: {r.snippet[:200]}")

    return "\n".join(parts)

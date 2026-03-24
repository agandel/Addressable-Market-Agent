"""Data models for the TAM/SOM assessment pipeline."""

from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field


class CompanyInput(BaseModel):
    """User-provided company information."""

    name: str = Field(description="Company name")
    industry: str = Field(description="Industry or sector")
    geography: str = Field(description="Primary operating geography (e.g. 'US', 'Europe', 'Global')")
    products_services: list[str] = Field(description="Key products or services offered")
    revenue_usd: float | None = Field(default=None, description="Annual revenue in USD if known")
    description: str | None = Field(default=None, description="Additional company description")


class IndustryClassification(BaseModel):
    """Industry classification result."""

    naics_code: str = Field(description="NAICS code")
    naics_description: str = Field(description="NAICS industry description")
    sic_code: str | None = Field(default=None, description="SIC code if applicable")
    sub_segments: list[str] = Field(description="Relevant market sub-segments")
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence score")


class MarketEstimate(BaseModel):
    """A market size estimate with methodology details."""

    value_usd: float = Field(description="Market size estimate in USD")
    year: int = Field(description="Reference year for the estimate")
    method: str = Field(description="Estimation method used (top_down, bottom_up, consensus)")
    assumptions: list[str] = Field(description="Key assumptions made")
    data_sources: list[str] = Field(description="Sources used for the estimate")
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence score")


class Competitor(BaseModel):
    """A competitor in the market."""

    name: str = Field(description="Competitor name")
    estimated_revenue_usd: float | None = Field(default=None, description="Estimated revenue in USD")
    market_share_pct: float | None = Field(default=None, description="Estimated market share percentage")
    source: str | None = Field(default=None, description="Source for the data")


class CompetitiveLandscape(BaseModel):
    """Competitive landscape analysis."""

    total_competitors_estimated: int = Field(description="Estimated total number of competitors")
    top_competitors: list[Competitor] = Field(description="Top competitors with details")
    market_concentration: str = Field(description="Market concentration: fragmented, moderate, or concentrated")
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence score")


class SOMEstimate(BaseModel):
    """Serviceable Obtainable Market estimate."""

    value_usd: float = Field(description="SOM estimate in USD")
    market_share_pct: float = Field(description="Estimated obtainable market share percentage")
    methodology: str = Field(description="How the SOM was calculated")
    assumptions: list[str] = Field(description="Key assumptions")
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence score")


class SearchResult(BaseModel):
    """A web search result."""

    title: str
    url: str
    snippet: str


class MarketDataPoint(BaseModel):
    """A structured data point extracted from search results."""

    metric: str = Field(description="What is being measured")
    value: str = Field(description="The value (e.g. '$4.2 billion')")
    year: int | None = Field(default=None, description="Reference year")
    source_url: str = Field(description="Source URL")
    source_name: str = Field(description="Source name")
    reliability: str = Field(description="Reliability: official_report, news_article, or estimate")


class FinalReport(BaseModel):
    """Complete TAM/SOM assessment report."""

    company: CompanyInput
    industry: IndustryClassification
    tam_top_down: MarketEstimate
    tam_bottom_up: MarketEstimate
    tam_consensus: MarketEstimate
    competitive_landscape: CompetitiveLandscape
    som: SOMEstimate
    methodology_notes: str = Field(description="Summary of methodology and caveats")
    generated_at: datetime = Field(default_factory=datetime.utcnow)

"""Main orchestrator for the TAM/SOM assessment pipeline."""

from __future__ import annotations

from rich.console import Console

from tam_agent.analysis.bottom_up import estimate_bottom_up
from tam_agent.analysis.competitive import analyze_competitive_landscape
from tam_agent.analysis.industry import classify_industry
from tam_agent.analysis.reconcile import reconcile_tam
from tam_agent.analysis.som import estimate_som
from tam_agent.analysis.top_down import estimate_top_down
from tam_agent.config import Settings
from tam_agent.llm.client import LLMClient
from tam_agent.llm.prompts import METHODOLOGY_SUMMARY, SYSTEM_PROMPT
from tam_agent.models import CompanyInput, FinalReport
from tam_agent.research.web_search import WebSearcher

console = Console()


class TAMAgent:
    """Orchestrates the multi-step TAM/SOM assessment pipeline."""

    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or Settings()
        self.llm = LLMClient(self.settings)
        self.searcher = WebSearcher(self.settings)

    def run(self, company: CompanyInput) -> FinalReport:
        """Execute the full TAM/SOM assessment pipeline."""

        # Step 1: Industry Classification
        console.print("\n[bold blue]Step 1/6:[/] Classifying industry...", highlight=False)
        industry = classify_industry(self.llm, company)
        console.print(
            f"  NAICS {industry.naics_code}: {industry.naics_description} "
            f"(confidence: {industry.confidence:.0%})"
        )

        # Step 2: Top-down TAM
        console.print("\n[bold blue]Step 2/6:[/] Estimating TAM (top-down)...", highlight=False)
        tam_td, _, _ = estimate_top_down(self.llm, self.searcher, company, industry)
        console.print(
            f"  Top-down TAM: ${tam_td.value_usd:,.0f} "
            f"(confidence: {tam_td.confidence:.0%})"
        )

        # Step 3: Bottom-up TAM
        console.print("\n[bold blue]Step 3/6:[/] Estimating TAM (bottom-up)...", highlight=False)
        tam_bu, _, _ = estimate_bottom_up(self.llm, self.searcher, company, industry)
        console.print(
            f"  Bottom-up TAM: ${tam_bu.value_usd:,.0f} "
            f"(confidence: {tam_bu.confidence:.0%})"
        )

        # Step 4: Reconcile
        console.print("\n[bold blue]Step 4/6:[/] Reconciling TAM estimates...", highlight=False)
        tam_consensus = reconcile_tam(
            self.llm, company.name, company.geography, tam_td, tam_bu
        )
        console.print(
            f"  Consensus TAM: ${tam_consensus.value_usd:,.0f} "
            f"(confidence: {tam_consensus.confidence:.0%})"
        )

        # Step 5: Competitive Landscape
        console.print("\n[bold blue]Step 5/6:[/] Analyzing competitive landscape...", highlight=False)
        competitive, _, _ = analyze_competitive_landscape(
            self.llm, self.searcher, company, industry
        )
        console.print(
            f"  Market concentration: {competitive.market_concentration} "
            f"({competitive.total_competitors_estimated} competitors)"
        )

        # Step 6: SOM
        console.print("\n[bold blue]Step 6/6:[/] Estimating SOM...", highlight=False)
        som = estimate_som(self.llm, company, tam_consensus, competitive)
        console.print(
            f"  SOM: ${som.value_usd:,.0f} ({som.market_share_pct:.1f}% share, "
            f"confidence: {som.confidence:.0%})"
        )

        # Generate methodology notes
        console.print("\n[dim]Generating methodology summary...[/]")
        methodology = self.llm.text_query(
            prompt=METHODOLOGY_SUMMARY.format(
                name=company.name,
                industry=company.industry,
                naics_code=industry.naics_code,
                geography=company.geography,
                tam_td=tam_td.value_usd,
                td_conf=f"{tam_td.confidence:.0%}",
                tam_bu=tam_bu.value_usd,
                bu_conf=f"{tam_bu.confidence:.0%}",
                tam_consensus=tam_consensus.value_usd,
                consensus_conf=f"{tam_consensus.confidence:.0%}",
                som=som.value_usd,
                som_share=som.market_share_pct,
                som_conf=f"{som.confidence:.0%}",
                num_competitors=len(competitive.top_competitors),
                concentration=competitive.market_concentration,
            ),
            system=SYSTEM_PROMPT,
        )

        console.print(
            f"\n[dim]Token usage: {self.llm.total_input_tokens:,} input, "
            f"{self.llm.total_output_tokens:,} output[/]"
        )

        return FinalReport(
            company=company,
            industry=industry,
            tam_top_down=tam_td,
            tam_bottom_up=tam_bu,
            tam_consensus=tam_consensus,
            competitive_landscape=competitive,
            som=som,
            methodology_notes=methodology,
        )

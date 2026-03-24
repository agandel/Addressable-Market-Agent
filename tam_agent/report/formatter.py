"""Console output formatting using Rich."""

from __future__ import annotations

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from tam_agent.models import FinalReport

console = Console()


def print_report(report: FinalReport) -> None:
    """Print a formatted report to the console."""
    r = report
    c = r.company

    # Header
    console.print()
    console.print(
        Panel(
            f"[bold]{c.name}[/bold]\n"
            f"{c.industry} | {c.geography}\n"
            f"Products: {', '.join(c.products_services)}",
            title="[bold green]TAM/SOM Assessment Report[/bold green]",
            border_style="green",
        )
    )

    # Industry Classification
    console.print(f"\n[bold]Industry Classification[/bold]")
    console.print(
        f"  NAICS {r.industry.naics_code}: {r.industry.naics_description} "
        f"(confidence: {r.industry.confidence:.0%})"
    )
    console.print(f"  Sub-segments: {', '.join(r.industry.sub_segments)}")

    # TAM Table
    tam_table = Table(title="\nTotal Addressable Market (TAM)", show_lines=True)
    tam_table.add_column("Method", style="cyan")
    tam_table.add_column("Estimate", style="green", justify="right")
    tam_table.add_column("Year", justify="center")
    tam_table.add_column("Confidence", justify="center")

    tam_table.add_row(
        "Top-Down",
        f"${r.tam_top_down.value_usd:,.0f}",
        str(r.tam_top_down.year),
        f"{r.tam_top_down.confidence:.0%}",
    )
    tam_table.add_row(
        "Bottom-Up",
        f"${r.tam_bottom_up.value_usd:,.0f}",
        str(r.tam_bottom_up.year),
        f"{r.tam_bottom_up.confidence:.0%}",
    )
    tam_table.add_row(
        "[bold]Consensus[/bold]",
        f"[bold]${r.tam_consensus.value_usd:,.0f}[/bold]",
        str(r.tam_consensus.year),
        f"[bold]{r.tam_consensus.confidence:.0%}[/bold]",
    )
    console.print(tam_table)

    # Competitive Landscape
    comp_table = Table(title="\nCompetitive Landscape", show_lines=True)
    comp_table.add_column("Competitor", style="cyan")
    comp_table.add_column("Est. Revenue", justify="right")
    comp_table.add_column("Market Share", justify="center")

    for comp in r.competitive_landscape.top_competitors[:8]:
        rev = f"${comp.estimated_revenue_usd:,.0f}" if comp.estimated_revenue_usd else "N/A"
        share = f"{comp.market_share_pct:.1f}%" if comp.market_share_pct else "N/A"
        comp_table.add_row(comp.name, rev, share)

    console.print(comp_table)
    console.print(
        f"  Market concentration: [bold]{r.competitive_landscape.market_concentration}[/bold] "
        f"| ~{r.competitive_landscape.total_competitors_estimated} total competitors"
    )

    # SOM
    console.print(
        Panel(
            f"[bold green]${r.som.value_usd:,.0f}[/bold green]\n"
            f"Market Share: {r.som.market_share_pct:.1f}%  |  "
            f"Confidence: {r.som.confidence:.0%}\n\n"
            f"{r.som.methodology}",
            title="[bold]Serviceable Obtainable Market (SOM)[/bold]",
            border_style="yellow",
        )
    )

    # Methodology
    console.print(f"\n[bold]Methodology Notes[/bold]")
    console.print(f"  {r.methodology_notes[:500]}{'...' if len(r.methodology_notes) > 500 else ''}")
    console.print()

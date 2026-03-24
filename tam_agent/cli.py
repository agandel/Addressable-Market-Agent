"""CLI entry point for the TAM/SOM assessment agent."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import click
from rich.console import Console

from tam_agent.agent import TAMAgent
from tam_agent.config import get_settings
from tam_agent.models import CompanyInput
from tam_agent.report.builder import to_json, to_markdown
from tam_agent.report.formatter import print_report

console = Console()


@click.group()
def main() -> None:
    """TAM/SOM Assessment Agent - AI-powered market sizing tool."""
    pass


@main.command()
@click.option("--name", required=True, help="Company name")
@click.option("--industry", required=True, help="Industry or sector")
@click.option("--geography", required=True, help="Primary geography (e.g. 'US', 'Europe', 'Global')")
@click.option(
    "--products",
    required=True,
    help="Comma-separated list of products/services",
)
@click.option("--revenue", type=float, default=None, help="Annual revenue in USD (optional)")
@click.option("--description", default=None, help="Additional company description")
@click.option(
    "--format",
    "output_format",
    type=click.Choice(["console", "markdown", "json"]),
    default="console",
    help="Output format",
)
@click.option("--output", "output_file", type=click.Path(), default=None, help="Output file path")
def analyze(
    name: str,
    industry: str,
    geography: str,
    products: str,
    revenue: float | None,
    description: str | None,
    output_format: str,
    output_file: str | None,
) -> None:
    """Run a TAM/SOM assessment for a company."""
    settings = get_settings()
    if not settings.anthropic_api_key:
        console.print("[red]Error:[/] ANTHROPIC_API_KEY is not set. See .env.example.", highlight=False)
        sys.exit(1)

    company = CompanyInput(
        name=name,
        industry=industry,
        geography=geography,
        products_services=[p.strip() for p in products.split(",")],
        revenue_usd=revenue,
        description=description,
    )

    console.print(
        f"\n[bold green]Starting TAM/SOM Assessment for {name}[/bold green]",
        highlight=False,
    )
    if not settings.brave_search_api_key:
        console.print(
            "[yellow]Note:[/] No BRAVE_SEARCH_API_KEY set. "
            "Analysis will rely on LLM knowledge only (lower confidence).",
            highlight=False,
        )

    agent = TAMAgent(settings)
    report = agent.run(company)

    # Output
    if output_format == "console":
        print_report(report)
    elif output_format == "markdown":
        md = to_markdown(report)
        if output_file:
            Path(output_file).write_text(md)
            console.print(f"\n[green]Report saved to {output_file}[/green]")
        else:
            console.print(md)
    elif output_format == "json":
        j = to_json(report)
        if output_file:
            Path(output_file).write_text(j)
            console.print(f"\n[green]Report saved to {output_file}[/green]")
        else:
            console.print(j)


@main.command()
@click.argument("input_file", type=click.Path(exists=True))
@click.option(
    "--format",
    "output_format",
    type=click.Choice(["console", "markdown", "json"]),
    default="console",
)
@click.option("--output", "output_file", type=click.Path(), default=None)
def from_file(input_file: str, output_format: str, output_file: str | None) -> None:
    """Run assessment from a JSON input file."""
    settings = get_settings()
    if not settings.anthropic_api_key:
        console.print("[red]Error:[/] ANTHROPIC_API_KEY is not set.", highlight=False)
        sys.exit(1)

    data = json.loads(Path(input_file).read_text())
    company = CompanyInput(**data)

    console.print(
        f"\n[bold green]Starting TAM/SOM Assessment for {company.name}[/bold green]",
        highlight=False,
    )

    agent = TAMAgent(settings)
    report = agent.run(company)

    if output_format == "console":
        print_report(report)
    elif output_format == "markdown":
        md = to_markdown(report)
        if output_file:
            Path(output_file).write_text(md)
        else:
            console.print(md)
    elif output_format == "json":
        j = to_json(report)
        if output_file:
            Path(output_file).write_text(j)
        else:
            console.print(j)


if __name__ == "__main__":
    main()

"""Report formatting and output."""

from __future__ import annotations

import json

from tam_agent.models import FinalReport


def to_json(report: FinalReport, indent: int = 2) -> str:
    """Serialize the report to JSON."""
    return report.model_dump_json(indent=indent)


def to_markdown(report: FinalReport) -> str:
    """Render the report as a Markdown document."""
    r = report
    c = r.company
    ind = r.industry

    competitors_table = "| Company | Est. Revenue | Market Share | Source |\n|---|---|---|---|\n"
    for comp in r.competitive_landscape.top_competitors:
        rev = f"${comp.estimated_revenue_usd:,.0f}" if comp.estimated_revenue_usd else "N/A"
        share = f"{comp.market_share_pct:.1f}%" if comp.market_share_pct else "N/A"
        competitors_table += f"| {comp.name} | {rev} | {share} | {comp.source or 'N/A'} |\n"

    tam_td_assumptions = "\n".join(f"  - {a}" for a in r.tam_top_down.assumptions)
    tam_bu_assumptions = "\n".join(f"  - {a}" for a in r.tam_bottom_up.assumptions)
    consensus_assumptions = "\n".join(f"  - {a}" for a in r.tam_consensus.assumptions)
    som_assumptions = "\n".join(f"  - {a}" for a in r.som.assumptions)

    td_sources = "\n".join(f"  - {s}" for s in r.tam_top_down.data_sources)
    bu_sources = "\n".join(f"  - {s}" for s in r.tam_bottom_up.data_sources)

    md = f"""# TAM/SOM Assessment: {c.name}

**Generated:** {r.generated_at.strftime('%Y-%m-%d %H:%M UTC')}

---

## Company Profile

| Field | Value |
|---|---|
| **Company** | {c.name} |
| **Industry** | {c.industry} |
| **Geography** | {c.geography} |
| **Products/Services** | {', '.join(c.products_services)} |
| **Revenue** | {'${:,.0f}'.format(c.revenue_usd) if c.revenue_usd else 'Not provided'} |

## Industry Classification

- **NAICS Code:** {ind.naics_code} — {ind.naics_description}
- **SIC Code:** {ind.sic_code or 'N/A'}
- **Sub-segments:** {', '.join(ind.sub_segments)}
- **Confidence:** {ind.confidence:.0%}

---

## Total Addressable Market (TAM)

### Top-Down Estimate

- **Value:** ${r.tam_top_down.value_usd:,.0f}
- **Reference Year:** {r.tam_top_down.year}
- **Confidence:** {r.tam_top_down.confidence:.0%}

**Assumptions:**
{tam_td_assumptions}

**Sources:**
{td_sources}

### Bottom-Up Estimate

- **Value:** ${r.tam_bottom_up.value_usd:,.0f}
- **Reference Year:** {r.tam_bottom_up.year}
- **Confidence:** {r.tam_bottom_up.confidence:.0%}

**Assumptions:**
{tam_bu_assumptions}

**Sources:**
{bu_sources}

### Consensus TAM

- **Value:** ${r.tam_consensus.value_usd:,.0f}
- **Reference Year:** {r.tam_consensus.year}
- **Confidence:** {r.tam_consensus.confidence:.0%}

**Assumptions:**
{consensus_assumptions}

---

## Competitive Landscape

- **Market Concentration:** {r.competitive_landscape.market_concentration}
- **Estimated Total Competitors:** {r.competitive_landscape.total_competitors_estimated}
- **Confidence:** {r.competitive_landscape.confidence:.0%}

### Top Competitors

{competitors_table}

---

## Serviceable Obtainable Market (SOM)

- **Value:** ${r.som.value_usd:,.0f}
- **Market Share:** {r.som.market_share_pct:.1f}%
- **Confidence:** {r.som.confidence:.0%}

**Methodology:** {r.som.methodology}

**Assumptions:**
{som_assumptions}

---

## Methodology Notes

{r.methodology_notes}
"""
    return md

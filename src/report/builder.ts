/** Report formatting and output. */

import type { FinalReport } from "../models.js";
import { formatUsd } from "../util/format.js";

export function toJson(report: FinalReport, indent = 2): string {
  return JSON.stringify(report, null, indent);
}

export function toMarkdown(report: FinalReport): string {
  const r = report;
  const c = r.company;
  const ind = r.industry;

  const competitorsTable =
    "| Company | Est. Revenue | Market Share | Source |\n|---|---|---|---|\n" +
    r.competitive_landscape.top_competitors
      .map((comp) => {
        const rev = comp.estimated_revenue_usd
          ? formatUsd(comp.estimated_revenue_usd)
          : "N/A";
        const share =
          comp.market_share_pct != null
            ? `${comp.market_share_pct.toFixed(1)}%`
            : "N/A";
        return `| ${comp.name} | ${rev} | ${share} | ${comp.source ?? "N/A"} |`;
      })
      .join("\n");

  const tamTdAssumptions = r.tam_top_down.assumptions
    .map((a) => `  - ${a}`)
    .join("\n");
  const tamBuAssumptions = r.tam_bottom_up.assumptions
    .map((a) => `  - ${a}`)
    .join("\n");
  const consensusAssumptions = r.tam_consensus.assumptions
    .map((a) => `  - ${a}`)
    .join("\n");
  const somAssumptions = r.som.assumptions.map((a) => `  - ${a}`).join("\n");

  const tdSources = r.tam_top_down.data_sources
    .map((s) => `  - ${s}`)
    .join("\n");
  const buSources = r.tam_bottom_up.data_sources
    .map((s) => `  - ${s}`)
    .join("\n");

  const revenue = c.revenue_usd ? formatUsd(c.revenue_usd) : "Not provided";
  const genDate = new Date(r.generated_at).toISOString().replace("T", " ").slice(0, 19) + " UTC";

  return `# TAM/SOM Assessment: ${c.name}

**Generated:** ${genDate}

---

## Company Profile

| Field | Value |
|---|---|
| **Company** | ${c.name} |
| **Industry** | ${c.industry} |
| **Geography** | ${c.geography} |
| **Products/Services** | ${c.products_services.join(", ")} |
| **Revenue** | ${revenue} |

## Industry Classification

- **NAICS Code:** ${ind.naics_code} — ${ind.naics_description}
- **SIC Code:** ${ind.sic_code ?? "N/A"}
- **Sub-segments:** ${ind.sub_segments.join(", ")}
- **Confidence:** ${(ind.confidence * 100).toFixed(0)}%

---

## Total Addressable Market (TAM)

### Top-Down Estimate

- **Value:** ${formatUsd(r.tam_top_down.value_usd)}
- **Reference Year:** ${r.tam_top_down.year}
- **Confidence:** ${(r.tam_top_down.confidence * 100).toFixed(0)}%

**Assumptions:**
${tamTdAssumptions}

**Sources:**
${tdSources}

### Bottom-Up Estimate

- **Value:** ${formatUsd(r.tam_bottom_up.value_usd)}
- **Reference Year:** ${r.tam_bottom_up.year}
- **Confidence:** ${(r.tam_bottom_up.confidence * 100).toFixed(0)}%

**Assumptions:**
${tamBuAssumptions}

**Sources:**
${buSources}

### Consensus TAM

- **Value:** ${formatUsd(r.tam_consensus.value_usd)}
- **Reference Year:** ${r.tam_consensus.year}
- **Confidence:** ${(r.tam_consensus.confidence * 100).toFixed(0)}%

**Assumptions:**
${consensusAssumptions}

---

## Competitive Landscape

- **Market Concentration:** ${r.competitive_landscape.market_concentration}
- **Estimated Total Competitors:** ${r.competitive_landscape.total_competitors_estimated}
- **Confidence:** ${(r.competitive_landscape.confidence * 100).toFixed(0)}%

### Top Competitors

${competitorsTable}

---

## Serviceable Obtainable Market (SOM)

- **Value:** ${formatUsd(r.som.value_usd)}
- **Market Share:** ${r.som.market_share_pct.toFixed(1)}%
- **Confidence:** ${(r.som.confidence * 100).toFixed(0)}%

**Methodology:** ${r.som.methodology}

**Assumptions:**
${somAssumptions}

---

## Methodology Notes

${r.methodology_notes}
`;
}

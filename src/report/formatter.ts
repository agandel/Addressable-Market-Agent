/** Console output formatting. */

import type { FinalReport } from "../models.js";
import { formatUsd, formatPct } from "../util/format.js";

export function printReport(report: FinalReport): void {
  const r = report;
  const c = r.company;

  const divider = "═".repeat(60);
  const thinDiv = "─".repeat(60);

  // Header
  console.log(`\n\x1b[32m${divider}\x1b[0m`);
  console.log(`\x1b[1;32m  TAM/SOM Assessment Report\x1b[0m`);
  console.log(`\x1b[32m${divider}\x1b[0m`);
  console.log(`  \x1b[1m${c.name}\x1b[0m`);
  console.log(`  ${c.industry} | ${c.geography}`);
  console.log(`  Products: ${c.products_services.join(", ")}`);

  // Industry Classification
  console.log(`\n\x1b[1mIndustry Classification\x1b[0m`);
  console.log(
    `  NAICS ${r.industry.naics_code}: ${r.industry.naics_description} ` +
      `(confidence: ${formatPct(r.industry.confidence)})`,
  );
  console.log(`  Sub-segments: ${r.industry.sub_segments.join(", ")}`);

  // TAM Table
  console.log(`\n\x1b[1mTotal Addressable Market (TAM)\x1b[0m`);
  console.log(`  ${thinDiv}`);
  console.log(
    `  ${"Method".padEnd(15)} ${"Estimate".padStart(20)} ${"Year".padStart(6)} ${"Confidence".padStart(12)}`,
  );
  console.log(`  ${thinDiv}`);
  console.log(
    `  ${"Top-Down".padEnd(15)} ${formatUsd(r.tam_top_down.value_usd).padStart(20)} ${String(r.tam_top_down.year).padStart(6)} ${formatPct(r.tam_top_down.confidence).padStart(12)}`,
  );
  console.log(
    `  ${"Bottom-Up".padEnd(15)} ${formatUsd(r.tam_bottom_up.value_usd).padStart(20)} ${String(r.tam_bottom_up.year).padStart(6)} ${formatPct(r.tam_bottom_up.confidence).padStart(12)}`,
  );
  console.log(
    `  \x1b[1m${"Consensus".padEnd(15)} ${formatUsd(r.tam_consensus.value_usd).padStart(20)} ${String(r.tam_consensus.year).padStart(6)} ${formatPct(r.tam_consensus.confidence).padStart(12)}\x1b[0m`,
  );
  console.log(`  ${thinDiv}`);

  // Competitors
  console.log(`\n\x1b[1mCompetitive Landscape\x1b[0m`);
  console.log(`  ${thinDiv}`);
  console.log(
    `  ${"Competitor".padEnd(25)} ${"Est. Revenue".padStart(18)} ${"Market Share".padStart(14)}`,
  );
  console.log(`  ${thinDiv}`);
  for (const comp of r.competitive_landscape.top_competitors.slice(0, 8)) {
    const rev = comp.estimated_revenue_usd
      ? formatUsd(comp.estimated_revenue_usd)
      : "N/A";
    const share =
      comp.market_share_pct != null
        ? `${comp.market_share_pct.toFixed(1)}%`
        : "N/A";
    console.log(
      `  ${comp.name.padEnd(25)} ${rev.padStart(18)} ${share.padStart(14)}`,
    );
  }
  console.log(`  ${thinDiv}`);
  console.log(
    `  Market concentration: \x1b[1m${r.competitive_landscape.market_concentration}\x1b[0m ` +
      `| ~${r.competitive_landscape.total_competitors_estimated} total competitors`,
  );

  // SOM
  console.log(`\n\x1b[33m${divider}\x1b[0m`);
  console.log(`\x1b[1m  Serviceable Obtainable Market (SOM)\x1b[0m`);
  console.log(`\x1b[33m${divider}\x1b[0m`);
  console.log(`  \x1b[1;32m${formatUsd(r.som.value_usd)}\x1b[0m`);
  console.log(
    `  Market Share: ${r.som.market_share_pct.toFixed(1)}%  |  ` +
      `Confidence: ${formatPct(r.som.confidence)}`,
  );
  console.log(`  ${r.som.methodology}`);

  // Methodology
  console.log(`\n\x1b[1mMethodology Notes\x1b[0m`);
  const notes = r.methodology_notes;
  console.log(`  ${notes.length > 500 ? notes.slice(0, 500) + "..." : notes}`);
  console.log();
}

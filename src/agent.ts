/** Main orchestrator for the TAM/SOM assessment pipeline. */

import { classifyIndustry } from "./analysis/industry.js";
import { estimateTopDown } from "./analysis/top-down.js";
import { estimateBottomUp } from "./analysis/bottom-up.js";
import { reconcileTam } from "./analysis/reconcile.js";
import { analyzeCompetitiveLandscape } from "./analysis/competitive.js";
import { estimateSom } from "./analysis/som.js";
import { getSettings, type Settings } from "./config.js";
import { LLMClient } from "./llm/client.js";
import { methodologySummaryPrompt, SYSTEM_PROMPT } from "./llm/prompts.js";
import type { CompanyInput, FinalReport } from "./models.js";
import { WebSearcher } from "./research/web-search.js";
import { formatUsd, formatPct } from "./util/format.js";

export type ProgressCallback = (
  step: number,
  totalSteps: number,
  label: string,
  detail?: string,
) => void;

export class TAMAgent {
  private llm: LLMClient;
  private searcher: WebSearcher;
  public onProgress?: ProgressCallback;

  constructor(settings?: Settings) {
    const s = settings ?? getSettings();
    this.llm = new LLMClient(s);
    this.searcher = new WebSearcher(s);
  }

  private emit(step: number, label: string, detail?: string) {
    if (this.onProgress) {
      this.onProgress(step, 6, label, detail);
    }
    const prefix = `\x1b[1;34mStep ${step}/6:\x1b[0m`;
    if (detail) {
      console.log(`${prefix} ${label}\n  ${detail}`);
    } else {
      console.log(`${prefix} ${label}`);
    }
  }

  async run(company: CompanyInput): Promise<FinalReport> {
    // Step 1: Industry Classification
    this.emit(1, "Classifying industry...");
    const industry = await classifyIndustry(this.llm, company);
    this.emit(
      1,
      "Industry classified",
      `NAICS ${industry.naics_code}: ${industry.naics_description} (confidence: ${formatPct(industry.confidence)})`,
    );

    // Step 2: Top-down TAM
    this.emit(2, "Estimating TAM (top-down)...");
    const { estimate: tamTd } = await estimateTopDown(
      this.llm,
      this.searcher,
      company,
      industry,
    );
    this.emit(
      2,
      "Top-down TAM estimated",
      `${formatUsd(tamTd.value_usd)} (confidence: ${formatPct(tamTd.confidence)})`,
    );

    // Step 3: Bottom-up TAM
    this.emit(3, "Estimating TAM (bottom-up)...");
    const { estimate: tamBu } = await estimateBottomUp(
      this.llm,
      this.searcher,
      company,
      industry,
    );
    this.emit(
      3,
      "Bottom-up TAM estimated",
      `${formatUsd(tamBu.value_usd)} (confidence: ${formatPct(tamBu.confidence)})`,
    );

    // Step 4: Reconcile
    this.emit(4, "Reconciling TAM estimates...");
    const tamConsensus = await reconcileTam(
      this.llm,
      company.name,
      company.geography,
      tamTd,
      tamBu,
    );
    this.emit(
      4,
      "Consensus TAM calculated",
      `${formatUsd(tamConsensus.value_usd)} (confidence: ${formatPct(tamConsensus.confidence)})`,
    );

    // Step 5: Competitive Landscape
    this.emit(5, "Analyzing competitive landscape...");
    const { landscape: competitive } = await analyzeCompetitiveLandscape(
      this.llm,
      this.searcher,
      company,
      industry,
    );
    this.emit(
      5,
      "Competitive landscape analyzed",
      `${competitive.market_concentration} concentration, ~${competitive.total_competitors_estimated} competitors`,
    );

    // Step 6: SOM
    this.emit(6, "Estimating SOM...");
    const som = await estimateSom(this.llm, company, tamConsensus, competitive);
    this.emit(
      6,
      "SOM estimated",
      `${formatUsd(som.value_usd)} (${som.market_share_pct.toFixed(1)}% share, confidence: ${formatPct(som.confidence)})`,
    );

    // Methodology summary
    console.log("\x1b[2mGenerating methodology summary...\x1b[0m");
    const methodology = await this.llm.textQuery(
      methodologySummaryPrompt({
        name: company.name,
        industry: company.industry,
        naics_code: industry.naics_code,
        geography: company.geography,
        tam_td: formatUsd(tamTd.value_usd),
        td_conf: formatPct(tamTd.confidence),
        tam_bu: formatUsd(tamBu.value_usd),
        bu_conf: formatPct(tamBu.confidence),
        tam_consensus: formatUsd(tamConsensus.value_usd),
        consensus_conf: formatPct(tamConsensus.confidence),
        som: formatUsd(som.value_usd),
        som_share: som.market_share_pct.toFixed(1),
        som_conf: formatPct(som.confidence),
        num_competitors: competitive.top_competitors.length,
        concentration: competitive.market_concentration,
      }),
      SYSTEM_PROMPT,
    );

    console.log(
      `\x1b[2mToken usage: ${this.llm.totalInputTokens.toLocaleString()} input, ` +
        `${this.llm.totalOutputTokens.toLocaleString()} output\x1b[0m`,
    );

    return {
      company,
      industry,
      tam_top_down: tamTd,
      tam_bottom_up: tamBu,
      tam_consensus: tamConsensus,
      competitive_landscape: competitive,
      som,
      methodology_notes: methodology,
      generated_at: new Date().toISOString(),
    };
  }
}

/** Public API for the TAM/SOM Assessment Agent. */

export { TAMAgent } from "./agent.js";
export { getSettings } from "./config.js";
export type { Settings } from "./config.js";
export type {
  CompanyInput,
  IndustryClassification,
  MarketEstimate,
  Competitor,
  CompetitiveLandscape,
  SOMEstimate,
  FinalReport,
} from "./models.js";
export { CompanyInputSchema } from "./models.js";
export { toJson, toMarkdown } from "./report/builder.js";
export { printReport } from "./report/formatter.js";

/** Configuration loaded from environment variables. */

export interface Settings {
  anthropicApiKey: string;
  braveSearchApiKey: string;
  tamAgentModel: string;
  tamAgentMaxSearches: number;
}

export function getSettings(): Settings {
  return {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
    braveSearchApiKey: process.env.BRAVE_SEARCH_API_KEY ?? "",
    tamAgentModel: process.env.TAM_AGENT_MODEL ?? "claude-sonnet-4-20250514",
    tamAgentMaxSearches: parseInt(
      process.env.TAM_AGENT_MAX_SEARCHES ?? "20",
      10,
    ),
  };
}

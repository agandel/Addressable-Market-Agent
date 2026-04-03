/** Configuration loaded from environment variables. */

export interface Settings {
  braveSearchApiKey: string;
  tamAgentMaxSearches: number;
}

export function getSettings(): Settings {
  return {
    braveSearchApiKey: process.env.BRAVE_SEARCH_API_KEY ?? "",
    tamAgentMaxSearches: parseInt(
      process.env.TAM_AGENT_MAX_SEARCHES ?? "20",
      10,
    ),
  };
}

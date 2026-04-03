/** Web search integration for gathering market data. */

import type { Settings } from "../config.js";
import type { SearchResult } from "../models.js";

export class WebSearcher {
  private apiKey: string;
  private maxSearches: number;
  private searchesDone = 0;

  constructor(settings: Settings) {
    this.apiKey = settings.braveSearchApiKey;
    this.maxSearches = settings.tamAgentMaxSearches;
  }

  get isAvailable(): boolean {
    return this.apiKey.length > 0;
  }

  get searchesRemaining(): number {
    return Math.max(0, this.maxSearches - this.searchesDone);
  }

  async search(
    query: string,
    numResults = 5,
  ): Promise<SearchResult[]> {
    if (!this.isAvailable || this.searchesRemaining <= 0) {
      return [];
    }

    this.searchesDone++;

    try {
      const url = new URL("https://api.search.brave.com/res/v1/web/search");
      url.searchParams.set("q", query);
      url.searchParams.set("count", String(numResults));

      const resp = await fetch(url.toString(), {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": this.apiKey,
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!resp.ok) return [];

      const data = (await resp.json()) as {
        web?: { results?: Array<{ title?: string; url?: string; description?: string }> };
      };

      return (data.web?.results ?? []).map((item) => ({
        title: item.title ?? "",
        url: item.url ?? "",
        snippet: item.description ?? "",
      }));
    } catch {
      return [];
    }
  }

  async multiSearch(
    queries: string[],
    numResults = 5,
  ): Promise<SearchResult[]> {
    const allResults: SearchResult[] = [];
    const seenUrls = new Set<string>();

    for (const query of queries) {
      if (this.searchesRemaining <= 0) break;
      const results = await this.search(query, numResults);
      for (const result of results) {
        if (!seenUrls.has(result.url)) {
          seenUrls.add(result.url);
          allResults.push(result);
        }
      }
    }

    return allResults;
  }
}

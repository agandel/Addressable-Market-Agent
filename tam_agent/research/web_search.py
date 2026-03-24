"""Web search integration for gathering market data."""

from __future__ import annotations

import httpx

from tam_agent.config import Settings
from tam_agent.models import SearchResult


class WebSearcher:
    """Executes web searches via Brave Search API, with graceful fallback."""

    def __init__(self, settings: Settings) -> None:
        self.api_key = settings.brave_search_api_key
        self.max_searches = settings.tam_agent_max_searches
        self._searches_done = 0

    @property
    def is_available(self) -> bool:
        return bool(self.api_key)

    @property
    def searches_remaining(self) -> int:
        return max(0, self.max_searches - self._searches_done)

    def search(self, query: str, num_results: int = 5) -> list[SearchResult]:
        """Execute a web search and return results.

        Returns an empty list if no API key is configured or quota is exhausted.
        """
        if not self.is_available or self.searches_remaining <= 0:
            return []

        self._searches_done += 1

        try:
            with httpx.Client(timeout=15.0) as client:
                resp = client.get(
                    "https://api.search.brave.com/res/v1/web/search",
                    headers={
                        "Accept": "application/json",
                        "Accept-Encoding": "gzip",
                        "X-Subscription-Token": self.api_key,
                    },
                    params={"q": query, "count": num_results},
                )
                resp.raise_for_status()
                data = resp.json()
        except (httpx.HTTPError, Exception):
            return []

        results: list[SearchResult] = []
        for item in data.get("web", {}).get("results", []):
            results.append(
                SearchResult(
                    title=item.get("title", ""),
                    url=item.get("url", ""),
                    snippet=item.get("description", ""),
                )
            )

        return results

    def multi_search(self, queries: list[str], num_results: int = 5) -> list[SearchResult]:
        """Execute multiple searches and deduplicate results."""
        all_results: list[SearchResult] = []
        seen_urls: set[str] = set()

        for query in queries:
            if self.searches_remaining <= 0:
                break
            for result in self.search(query, num_results):
                if result.url not in seen_urls:
                    seen_urls.add(result.url)
                    all_results.append(result)

        return all_results

"""Anthropic SDK wrapper with structured output via tool-use."""

from __future__ import annotations

import json
from typing import TypeVar

import anthropic
from pydantic import BaseModel

from tam_agent.config import Settings

T = TypeVar("T", bound=BaseModel)


class LLMClient:
    """Wrapper around the Anthropic API that returns structured Pydantic models."""

    def __init__(self, settings: Settings) -> None:
        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        self.model = settings.tam_agent_model
        self.total_input_tokens = 0
        self.total_output_tokens = 0

    def structured_query(
        self,
        prompt: str,
        response_model: type[T],
        system: str | None = None,
        temperature: float = 0.2,
    ) -> T:
        """Send a prompt and get back a validated Pydantic model.

        Uses Claude's tool-use feature to force structured JSON output matching
        the response_model schema.
        """
        tool_name = f"provide_{response_model.__name__}"
        tool = {
            "name": tool_name,
            "description": f"Provide the structured {response_model.__name__} result.",
            "input_schema": response_model.model_json_schema(),
        }

        messages = [{"role": "user", "content": prompt}]
        kwargs: dict = {
            "model": self.model,
            "max_tokens": 4096,
            "temperature": temperature,
            "tools": [tool],
            "tool_choice": {"type": "tool", "name": tool_name},
            "messages": messages,
        }
        if system:
            kwargs["system"] = system

        response = self.client.messages.create(**kwargs)

        self.total_input_tokens += response.usage.input_tokens
        self.total_output_tokens += response.usage.output_tokens

        for block in response.content:
            if block.type == "tool_use" and block.name == tool_name:
                return response_model.model_validate(block.input)

        raise RuntimeError(f"LLM did not return expected tool call '{tool_name}'")

    def text_query(
        self,
        prompt: str,
        system: str | None = None,
        temperature: float = 0.2,
    ) -> str:
        """Send a prompt and get back plain text."""
        messages = [{"role": "user", "content": prompt}]
        kwargs: dict = {
            "model": self.model,
            "max_tokens": 4096,
            "temperature": temperature,
            "messages": messages,
        }
        if system:
            kwargs["system"] = system

        response = self.client.messages.create(**kwargs)
        self.total_input_tokens += response.usage.input_tokens
        self.total_output_tokens += response.usage.output_tokens

        return "".join(
            block.text for block in response.content if block.type == "text"
        )

    def generate_search_queries(self, context: str, num_queries: int = 4) -> list[str]:
        """Ask the LLM to generate targeted search queries."""

        class SearchQueries(BaseModel):
            queries: list[str]

        result = self.structured_query(
            prompt=(
                f"Generate {num_queries} specific web search queries to find market data. "
                f"Focus on finding quantitative market size data, revenue figures, and industry reports.\n\n"
                f"Context:\n{context}\n\n"
                f"Return exactly {num_queries} search queries optimized for finding market sizing data."
            ),
            response_model=SearchQueries,
            system="You are a market research analyst. Generate precise search queries.",
        )
        return result.queries

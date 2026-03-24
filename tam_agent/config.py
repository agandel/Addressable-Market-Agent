"""Configuration management."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    anthropic_api_key: str = ""
    brave_search_api_key: str = ""
    tam_agent_model: str = "claude-sonnet-4-20250514"
    tam_agent_max_searches: int = 20

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


def get_settings() -> Settings:
    return Settings()

# TAM/SOM Assessment Agent

AI-powered Total Addressable Market (TAM) and Serviceable Obtainable Market (SOM) estimation tool. Works for any company, industry, and geography.

## How It Works

The agent runs a 6-step analysis pipeline:

1. **Industry Classification** — Maps the company to NAICS/SIC codes and identifies market sub-segments
2. **Top-Down TAM** — Estimates market size from industry reports, narrowing from broad market to specific segments
3. **Bottom-Up TAM** — Estimates market size from customer counts × average revenue per customer
4. **TAM Reconciliation** — Produces a consensus TAM by analyzing divergence between the two approaches
5. **Competitive Landscape** — Identifies top competitors, market shares, and concentration
6. **SOM Estimation** — Calculates realistic obtainable market share based on competitive position

Each step uses Claude as the reasoning engine, with optional web search (Brave Search API) for live market data. All estimates include confidence scores, assumptions, and source citations.

## Setup

```bash
pip install -e .
```

Create a `.env` file (see `.env.example`):

```
ANTHROPIC_API_KEY=your-key-here
BRAVE_SEARCH_API_KEY=your-brave-key-here  # optional, improves accuracy
```

## Usage

### CLI

```bash
# Basic analysis
tam-agent analyze \
  --name "Acme Corp" \
  --industry "cybersecurity" \
  --geography "North America" \
  --products "endpoint detection, SIEM, threat intelligence" \
  --revenue 50000000

# Output as Markdown
tam-agent analyze \
  --name "Stripe" \
  --industry "payment processing" \
  --geography "Global" \
  --products "online payments, billing, financial infrastructure" \
  --format markdown \
  --output report.md

# Output as JSON
tam-agent analyze \
  --name "Rivian" \
  --industry "electric vehicles" \
  --geography "US" \
  --products "electric trucks, electric SUVs, fleet vehicles" \
  --format json \
  --output report.json

# From a JSON input file
tam-agent from-file company.json --format markdown --output report.md
```

### JSON Input File Format

```json
{
  "name": "Acme Corp",
  "industry": "cybersecurity",
  "geography": "North America",
  "products_services": ["endpoint detection", "SIEM", "threat intelligence"],
  "revenue_usd": 50000000,
  "description": "Mid-market cybersecurity company focused on enterprise clients"
}
```

### Python API

```python
from tam_agent.agent import TAMAgent
from tam_agent.models import CompanyInput

company = CompanyInput(
    name="Acme Corp",
    industry="cybersecurity",
    geography="North America",
    products_services=["endpoint detection", "SIEM"],
    revenue_usd=50_000_000,
)

agent = TAMAgent()
report = agent.run(company)

print(f"TAM: ${report.tam_consensus.value_usd:,.0f}")
print(f"SOM: ${report.som.value_usd:,.0f} ({report.som.market_share_pct:.1f}%)")
```

## Output

The agent produces:
- **Console** (default): Rich-formatted tables and panels
- **Markdown**: Full report with tables, suitable for sharing
- **JSON**: Machine-readable structured output

Every estimate includes:
- Dollar value and reference year
- Methodology description
- Key assumptions listed explicitly
- Data sources cited
- Confidence score (0-100%)

## Configuration

| Environment Variable | Required | Default | Description |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | — | Anthropic API key |
| `BRAVE_SEARCH_API_KEY` | No | — | Enables live web search for market data |
| `TAM_AGENT_MODEL` | No | `claude-sonnet-4-20250514` | Claude model to use |
| `TAM_AGENT_MAX_SEARCHES` | No | `20` | Max web searches per analysis run |

## Tests

```bash
pip install -e ".[dev]"
pytest
```

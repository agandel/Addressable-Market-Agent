# TAM/SOM Assessment Agent

AI-powered Total Addressable Market (TAM) and Serviceable Obtainable Market (SOM) estimation tool. Works for any company, industry, and geography.

Built with TypeScript for Node.js, using the Anthropic Claude API.

## How It Works

The agent runs a 6-step analysis pipeline:

1. **Industry Classification** — Maps the company to NAICS/SIC codes and identifies market sub-segments
2. **Top-Down TAM** — Estimates market size from industry reports, narrowing from broad market to specific segments
3. **Bottom-Up TAM** — Estimates market size from customer counts × average revenue per customer
4. **TAM Reconciliation** — Produces a consensus TAM by analyzing divergence between the two approaches
5. **Competitive Landscape** — Identifies top competitors, market shares, and concentration
6. **SOM Estimation** — Calculates realistic obtainable market share based on competitive position

Each step uses Claude as the reasoning engine with structured output via tool-use. Optional web search (Brave Search API) provides live market data for higher-confidence estimates.

## Requirements

- Node.js >= 20
- Anthropic API key

## Setup

```bash
npm install
npm run build
```

Create a `.env` file (see `.env.example`):

```
ANTHROPIC_API_KEY=your-key-here
BRAVE_SEARCH_API_KEY=your-brave-key-here  # optional, improves accuracy
```

## Usage

### Web UI

The easiest way to use the agent. Start the server and open your browser:

```bash
# Development mode (no build required)
npm run serve

# Or after building
npm run build
node dist/server.js
```

Then open **http://localhost:3000** in your browser. Fill in the form and click "Run Assessment" to get live progress updates and a full report with download options.

Set a custom port with `PORT=8080 npm run serve`.

### CLI

```bash
# Basic analysis
node dist/cli.js analyze \
  --name "Acme Corp" \
  --industry "cybersecurity" \
  --geography "North America" \
  --products "endpoint detection, SIEM, threat intelligence" \
  --revenue 50000000

# Output as Markdown
node dist/cli.js analyze \
  --name "Stripe" \
  --industry "payment processing" \
  --geography "Global" \
  --products "online payments, billing, financial infrastructure" \
  --format markdown \
  --output report.md

# Output as JSON
node dist/cli.js analyze \
  --name "Rivian" \
  --industry "electric vehicles" \
  --geography "US" \
  --products "electric trucks, electric SUVs, fleet vehicles" \
  --format json \
  --output report.json

# From a JSON input file
node dist/cli.js from-file company.json --format markdown --output report.md
```

### Development mode (no build step)

```bash
npx tsx src/cli.ts analyze \
  --name "Acme Corp" \
  --industry "cybersecurity" \
  --geography "US" \
  --products "endpoint detection, SIEM"
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

### Node.js API

```typescript
import { TAMAgent } from "tam-agent";
import type { CompanyInput } from "tam-agent";

const company: CompanyInput = {
  name: "Acme Corp",
  industry: "cybersecurity",
  geography: "North America",
  products_services: ["endpoint detection", "SIEM"],
  revenue_usd: 50_000_000,
};

const agent = new TAMAgent();
const report = await agent.run(company);

console.log(`TAM: $${report.tam_consensus.value_usd.toLocaleString()}`);
console.log(`SOM: $${report.som.value_usd.toLocaleString()} (${report.som.market_share_pct}%)`);
```

## Output

The agent produces:
- **Console** (default): Formatted tables with ANSI colors
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
npm test
```

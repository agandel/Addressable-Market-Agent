/** Web server for the TAM/SOM assessment UI. */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import express from "express";
import { TAMAgent } from "./agent.js";
import { getSettings } from "./config.js";
import type { CompanyInput } from "./models.js";
import { toJson, toMarkdown } from "./report/builder.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

// Serve the HTML UI
app.get("/", (_req, res) => {
  const htmlPath = join(__dirname, "..", "src", "web", "index.html");
  try {
    const html = readFileSync(htmlPath, "utf-8");
    res.type("html").send(html);
  } catch {
    // Fallback for when running from dist/
    const altPath = join(__dirname, "..", "web", "index.html");
    const html = readFileSync(altPath, "utf-8");
    res.type("html").send(html);
  }
});

// SSE endpoint for running analysis with live progress
app.post("/api/analyze", (req, res) => {
  const body = req.body as {
    name?: string;
    industry?: string;
    geography?: string;
    products?: string;
    revenue?: string;
    description?: string;
  };

  if (!body.name || !body.industry || !body.geography || !body.products) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const settings = getSettings();
  if (!settings.braveSearchApiKey) {
    res.status(500).json({ error: "BRAVE_SEARCH_API_KEY is not configured on the server." });
    return;
  }

  // Set up SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const company: CompanyInput = {
    name: body.name,
    industry: body.industry,
    geography: body.geography,
    products_services: body.products.split(",").map((s) => s.trim()).filter(Boolean),
    revenue_usd: body.revenue ? parseFloat(body.revenue) : null,
    description: body.description || null,
  };

  const agent = new TAMAgent(settings);
  agent.onProgress = (step, totalSteps, label, detail) => {
    send("progress", { step, totalSteps, label, detail });
  };

  agent
    .run(company)
    .then((report) => {
      send("result", {
        report,
        markdown: toMarkdown(report),
        json: toJson(report),
      });
      res.end();
    })
    .catch((err: Error) => {
      send("error", { message: err.message });
      res.end();
    });
});

const PORT = parseInt(process.env.PORT ?? "3000", 10);
app.listen(PORT, () => {
  console.log(`\n  TAM/SOM Assessment Agent UI`);
  console.log(`  Running at: http://localhost:${PORT}\n`);
});

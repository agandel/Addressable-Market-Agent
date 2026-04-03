#!/usr/bin/env node

/** CLI entry point for the TAM/SOM assessment agent. */

import { readFileSync, writeFileSync } from "node:fs";
import { Command } from "commander";
import { TAMAgent } from "./agent.js";
import { getSettings } from "./config.js";
import { CompanyInputSchema, type CompanyInput } from "./models.js";
import { toJson, toMarkdown } from "./report/builder.js";
import { printReport } from "./report/formatter.js";

const program = new Command();

program
  .name("tam-agent")
  .description("TAM/SOM Assessment Agent — AI-powered market sizing tool")
  .version("0.1.0");

program
  .command("analyze")
  .description("Run a TAM/SOM assessment for a company")
  .requiredOption("--name <name>", "Company name")
  .requiredOption("--industry <industry>", "Industry or sector")
  .requiredOption(
    "--geography <geography>",
    "Primary geography (e.g. 'US', 'Europe', 'Global')",
  )
  .requiredOption(
    "--products <products>",
    "Comma-separated list of products/services",
  )
  .option("--revenue <revenue>", "Annual revenue in USD", parseFloat)
  .option("--description <description>", "Additional company description")
  .option(
    "--format <format>",
    "Output format: console, markdown, json",
    "console",
  )
  .option("--output <file>", "Output file path")
  .action(async (opts) => {
    const settings = getSettings();
    if (!settings.braveSearchApiKey) {
      console.error(
        "Error: BRAVE_SEARCH_API_KEY is not set. See .env.example.",
      );
      process.exit(1);
    }

    const company: CompanyInput = {
      name: opts.name,
      industry: opts.industry,
      geography: opts.geography,
      products_services: (opts.products as string)
        .split(",")
        .map((s: string) => s.trim()),
      revenue_usd: opts.revenue ?? null,
      description: opts.description ?? null,
    };

    console.log(
      `\n\x1b[1;32mStarting TAM/SOM Assessment for ${company.name}\x1b[0m`,
    );

    const agent = new TAMAgent(settings);
    const report = await agent.run(company);

    outputReport(report, opts.format, opts.output);
  });

program
  .command("from-file")
  .description("Run assessment from a JSON input file")
  .argument("<input-file>", "Path to JSON input file")
  .option(
    "--format <format>",
    "Output format: console, markdown, json",
    "console",
  )
  .option("--output <file>", "Output file path")
  .action(async (inputFile: string, opts) => {
    const settings = getSettings();
    if (!settings.braveSearchApiKey) {
      console.error("Error: BRAVE_SEARCH_API_KEY is not set. See .env.example.");
      process.exit(1);
    }

    const raw = JSON.parse(readFileSync(inputFile, "utf-8"));
    const company = CompanyInputSchema.parse(raw);

    console.log(
      `\n\x1b[1;32mStarting TAM/SOM Assessment for ${company.name}\x1b[0m`,
    );

    const agent = new TAMAgent(settings);
    const report = await agent.run(company);

    outputReport(report, opts.format, opts.output);
  });

function outputReport(
  report: import("./models.js").FinalReport,
  format: string,
  outputFile?: string,
): void {
  if (format === "console") {
    printReport(report);
  } else if (format === "markdown") {
    const md = toMarkdown(report);
    if (outputFile) {
      writeFileSync(outputFile, md, "utf-8");
      console.log(`\nReport saved to ${outputFile}`);
    } else {
      console.log(md);
    }
  } else if (format === "json") {
    const j = toJson(report);
    if (outputFile) {
      writeFileSync(outputFile, j, "utf-8");
      console.log(`\nReport saved to ${outputFile}`);
    } else {
      console.log(j);
    }
  }
}

program.parse();

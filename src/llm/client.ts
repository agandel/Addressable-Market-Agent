/** Anthropic SDK wrapper with structured output via tool-use. */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodToJsonSchema } from "../util/zod-to-json-schema.js";
import type { Settings } from "../config.js";

export class LLMClient {
  private client: Anthropic;
  private model: string;
  public totalInputTokens = 0;
  public totalOutputTokens = 0;

  constructor(settings: Settings) {
    this.client = new Anthropic({ apiKey: settings.anthropicApiKey });
    this.model = settings.tamAgentModel;
  }

  /**
   * Send a prompt and get back a validated object matching the Zod schema.
   * Uses Claude's tool-use feature to force structured JSON output.
   */
  async structuredQuery<T>(
    prompt: string,
    schema: z.ZodType<T>,
    schemaName: string,
    system?: string,
    temperature = 0.2,
  ): Promise<T> {
    const toolName = `provide_${schemaName}`;
    const tool: Anthropic.Tool = {
      name: toolName,
      description: `Provide the structured ${schemaName} result.`,
      input_schema: zodToJsonSchema(schema) as Anthropic.Tool.InputSchema,
    };

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      temperature,
      system: system ?? undefined,
      tools: [tool],
      tool_choice: { type: "tool" as const, name: toolName },
      messages: [{ role: "user", content: prompt }],
    });

    this.totalInputTokens += response.usage.input_tokens;
    this.totalOutputTokens += response.usage.output_tokens;

    for (const block of response.content) {
      if (block.type === "tool_use" && block.name === toolName) {
        return schema.parse(block.input);
      }
    }

    throw new Error(`LLM did not return expected tool call '${toolName}'`);
  }

  /** Send a prompt and get back plain text. */
  async textQuery(
    prompt: string,
    system?: string,
    temperature = 0.2,
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      temperature,
      system: system ?? undefined,
      messages: [{ role: "user", content: prompt }],
    });

    this.totalInputTokens += response.usage.input_tokens;
    this.totalOutputTokens += response.usage.output_tokens;

    return response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
  }

  /** Ask the LLM to generate targeted search queries. */
  async generateSearchQueries(
    context: string,
    numQueries = 4,
  ): Promise<string[]> {
    const schema = z.object({ queries: z.array(z.string()) });

    const result = await this.structuredQuery(
      `Generate ${numQueries} specific web search queries to find market data. ` +
        `Focus on finding quantitative market size data, revenue figures, and industry reports.\n\n` +
        `Context:\n${context}\n\n` +
        `Return exactly ${numQueries} search queries optimized for finding market sizing data.`,
      schema,
      "SearchQueries",
      "You are a market research analyst. Generate precise search queries.",
    );
    return result.queries;
  }
}

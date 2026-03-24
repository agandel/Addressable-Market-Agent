/** Brave Search AI Answers wrapper with structured output via JSON prompting. */

import { z } from "zod";
import { zodToJsonSchema } from "../util/zod-to-json-schema.js";
import type { Settings } from "../config.js";

interface BraveChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface BraveChatResponse {
  choices: Array<{
    message: { content: string };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

export class LLMClient {
  private apiKey: string;
  public totalInputTokens = 0;
  public totalOutputTokens = 0;

  constructor(settings: Settings) {
    this.apiKey = settings.braveSearchApiKey;
  }

  private async chat(
    messages: BraveChatMessage[],
  ): Promise<BraveChatResponse> {
    const resp = await fetch(
      "https://api.search.brave.com/res/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "x-subscription-token": this.apiKey,
        },
        body: JSON.stringify({
          model: "brave",
          stream: false,
          messages,
        }),
        signal: AbortSignal.timeout(60_000),
      },
    );

    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Brave API error ${resp.status}: ${body}`);
    }

    const data = (await resp.json()) as BraveChatResponse;

    if (data.usage) {
      this.totalInputTokens += data.usage.prompt_tokens ?? 0;
      this.totalOutputTokens += data.usage.completion_tokens ?? 0;
    }

    return data;
  }

  /**
   * Send a prompt and get back a validated object matching the Zod schema.
   * Instructs the model to reply with JSON matching the schema, then parses it.
   */
  async structuredQuery<T>(
    prompt: string,
    schema: z.ZodType<T>,
    schemaName: string,
    system?: string,
    _temperature = 0.2,
  ): Promise<T> {
    const jsonSchema = zodToJsonSchema(schema);

    const jsonInstruction =
      `\n\nYou MUST respond with ONLY a valid JSON object (no markdown, no code fences, no extra text) ` +
      `matching this schema:\n${JSON.stringify(jsonSchema, null, 2)}\n\n` +
      `Schema name: ${schemaName}. Return ONLY the JSON object.`;

    const messages: BraveChatMessage[] = [];
    if (system) {
      messages.push({ role: "system", content: system });
    }
    messages.push({ role: "user", content: prompt + jsonInstruction });

    const response = await this.chat(messages);
    const text = response.choices[0]?.message?.content ?? "";

    // Extract JSON from the response — handle possible markdown fences
    const jsonStr = extractJson(text);
    const parsed = JSON.parse(jsonStr);
    return schema.parse(parsed);
  }

  /** Send a prompt and get back plain text. */
  async textQuery(
    prompt: string,
    system?: string,
    _temperature = 0.2,
  ): Promise<string> {
    const messages: BraveChatMessage[] = [];
    if (system) {
      messages.push({ role: "system", content: system });
    }
    messages.push({ role: "user", content: prompt });

    const response = await this.chat(messages);
    return response.choices[0]?.message?.content ?? "";
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

/** Extract a JSON object from text that may contain markdown fences or extra prose. */
function extractJson(text: string): string {
  // Try to find JSON in code fences first
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // Try to find a top-level JSON object
  const braceStart = text.indexOf("{");
  const braceEnd = text.lastIndexOf("}");
  if (braceStart !== -1 && braceEnd > braceStart) {
    return text.slice(braceStart, braceEnd + 1);
  }

  // Fall back to full text
  return text.trim();
}

/** Industry classification analysis. */

import type { LLMClient } from "../llm/client.js";
import { industryClassificationPrompt, SYSTEM_PROMPT } from "../llm/prompts.js";
import {
  IndustryClassificationSchema,
  type CompanyInput,
  type IndustryClassification,
} from "../models.js";

export async function classifyIndustry(
  llm: LLMClient,
  company: CompanyInput,
): Promise<IndustryClassification> {
  const descriptionSection = company.description
    ? `Description: ${company.description}`
    : "";

  const prompt = industryClassificationPrompt({
    name: company.name,
    industry: company.industry,
    geography: company.geography,
    products_services: company.products_services.join(", "),
    description_section: descriptionSection,
  });

  return llm.structuredQuery(
    prompt,
    IndustryClassificationSchema,
    "IndustryClassification",
    SYSTEM_PROMPT,
  );
}

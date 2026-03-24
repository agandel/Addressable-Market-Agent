import { toJson, toMarkdown } from "../src/report/builder.js";
import type {
  CompanyInput,
  IndustryClassification,
  MarketEstimate,
  CompetitiveLandscape,
  SOMEstimate,
  FinalReport,
} from "../src/models.js";

const sampleCompany: CompanyInput = {
  name: "Acme Cyber",
  industry: "Cybersecurity",
  geography: "North America",
  products_services: ["endpoint detection", "SIEM", "threat intelligence"],
  revenue_usd: 50_000_000,
  description: "Mid-market cybersecurity company.",
};

const sampleIndustry: IndustryClassification = {
  naics_code: "541512",
  naics_description: "Computer Systems Design Services",
  sic_code: "7372",
  sub_segments: ["Endpoint Security", "SIEM", "Threat Intelligence"],
  confidence: 0.85,
};

const sampleEstimate: MarketEstimate = {
  value_usd: 180_000_000_000,
  year: 2025,
  method: "top_down",
  assumptions: ["Global cybersecurity market", "NA is 40%"],
  data_sources: ["Gartner", "Statista"],
  confidence: 0.7,
};

const sampleCompetitive: CompetitiveLandscape = {
  total_competitors_estimated: 500,
  top_competitors: [
    { name: "CrowdStrike", estimated_revenue_usd: 3_000_000_000, market_share_pct: 4.2 },
    { name: "Palo Alto Networks", estimated_revenue_usd: 6_000_000_000, market_share_pct: 8.3 },
  ],
  market_concentration: "moderate",
  confidence: 0.65,
};

const sampleSom: SOMEstimate = {
  value_usd: 900_000_000,
  market_share_pct: 0.5,
  methodology: "Based on current revenue trajectory",
  assumptions: ["3-5 year growth window"],
  confidence: 0.5,
};

function buildReport(): FinalReport {
  return {
    company: sampleCompany,
    industry: sampleIndustry,
    tam_top_down: sampleEstimate,
    tam_bottom_up: sampleEstimate,
    tam_consensus: sampleEstimate,
    competitive_landscape: sampleCompetitive,
    som: sampleSom,
    methodology_notes: "Test notes.",
    generated_at: new Date().toISOString(),
  };
}

describe("toMarkdown", () => {
  test("includes company name and key sections", () => {
    const md = toMarkdown(buildReport());
    expect(md).toContain("# TAM/SOM Assessment: Acme Cyber");
    expect(md).toContain("Consensus TAM");
    expect(md).toContain("CrowdStrike");
  });
});

describe("toJson", () => {
  test("produces valid JSON with expected fields", () => {
    const j = toJson(buildReport());
    expect(j).toContain('"Acme Cyber"');
    expect(j).toContain('"value_usd"');
    const parsed = JSON.parse(j);
    expect(parsed.company.name).toBe("Acme Cyber");
  });
});

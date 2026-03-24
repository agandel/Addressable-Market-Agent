import {
  CompanyInputSchema,
  IndustryClassificationSchema,
  MarketEstimateSchema,
  CompetitiveLandscapeSchema,
  SOMEstimateSchema,
  SearchResultSchema,
} from "../src/models.js";
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
  methodology: "Based on current revenue trajectory and competitive position",
  assumptions: ["3-5 year growth window", "Maintains current growth rate"],
  confidence: 0.5,
};

describe("CompanyInput", () => {
  test("parses minimal input", () => {
    const result = CompanyInputSchema.parse({
      name: "Test Co",
      industry: "Tech",
      geography: "US",
      products_services: ["SaaS"],
    });
    expect(result.name).toBe("Test Co");
    expect(result.revenue_usd).toBeUndefined();
  });

  test("parses full input", () => {
    const result = CompanyInputSchema.parse(sampleCompany);
    expect(result.revenue_usd).toBe(50_000_000);
    expect(result.products_services).toHaveLength(3);
  });
});

describe("IndustryClassification", () => {
  test("parses valid classification", () => {
    const result = IndustryClassificationSchema.parse(sampleIndustry);
    expect(result.naics_code).toBe("541512");
    expect(result.sub_segments).toHaveLength(3);
  });
});

describe("MarketEstimate", () => {
  test("round-trips through JSON", () => {
    const result = MarketEstimateSchema.parse(sampleEstimate);
    const json = JSON.stringify(result);
    const loaded = MarketEstimateSchema.parse(JSON.parse(json));
    expect(loaded.value_usd).toBe(180_000_000_000);
    expect(loaded.method).toBe("top_down");
  });
});

describe("FinalReport", () => {
  test("can be assembled and serialized", () => {
    const report: FinalReport = {
      company: sampleCompany,
      industry: sampleIndustry,
      tam_top_down: sampleEstimate,
      tam_bottom_up: sampleEstimate,
      tam_consensus: sampleEstimate,
      competitive_landscape: sampleCompetitive,
      som: sampleSom,
      methodology_notes: "Test methodology.",
      generated_at: new Date().toISOString(),
    };

    const json = JSON.stringify(report);
    const loaded = JSON.parse(json) as FinalReport;
    expect(loaded.company.name).toBe("Acme Cyber");
    expect(loaded.tam_consensus.value_usd).toBe(180_000_000_000);
  });
});

describe("SearchResult", () => {
  test("parses valid result", () => {
    const result = SearchResultSchema.parse({
      title: "Test",
      url: "https://example.com",
      snippet: "A snippet",
    });
    expect(result.url).toBe("https://example.com");
  });
});

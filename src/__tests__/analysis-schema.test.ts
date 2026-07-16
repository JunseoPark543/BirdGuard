import { describe, expect, it } from "vitest";

import { mockBuildingAnalysis } from "@/mocks/building-analysis";
import { buildingAnalysisSchema } from "@/schemas/analysis";

describe("buildingAnalysisSchema", () => {
  it("parses a valid analysis response", () => {
    expect(buildingAnalysisSchema.parse(mockBuildingAnalysis).schemaVersion).toBe(1);
  });

  it("rejects confidence below 0", () => {
    expect(() =>
      buildingAnalysisSchema.parse({
        ...mockBuildingAnalysis,
        classificationConfidence: -1,
      }),
    ).toThrow();
  });

  it("rejects confidence above 100", () => {
    expect(() =>
      buildingAnalysisSchema.parse({
        ...mockBuildingAnalysis,
        classificationConfidence: 101,
      }),
    ).toThrow();
  });

  it("rejects an invalid category ID", () => {
    expect(() =>
      buildingAnalysisSchema.parse({
        ...mockBuildingAnalysis,
        primaryCategory: "invalid-category",
      }),
    ).toThrow();
  });

  it("rejects more than 3 secondary categories", () => {
    expect(() =>
      buildingAnalysisSchema.parse({
        ...mockBuildingAnalysis,
        secondaryCategories: [
          { category: "commercial", confidence: 50 },
          { category: "glass-facade", confidence: 50 },
          { category: "near-nature", confidence: 50 },
          { category: "other", confidence: 50 },
        ],
      }),
    ).toThrow();
  });

  it("rejects duplicate primary and secondary categories", () => {
    expect(() =>
      buildingAnalysisSchema.parse({
        ...mockBuildingAnalysis,
        secondaryCategories: [{ category: mockBuildingAnalysis.primaryCategory, confidence: 50 }],
      }),
    ).toThrow();
  });
});

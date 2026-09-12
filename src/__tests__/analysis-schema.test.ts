import { describe, expect, it } from "vitest";

import { mockBuildingAnalysis } from "@/mocks/building-analysis";
import { buildingAnalysisSchema } from "@/schemas/analysis";

describe("buildingAnalysisSchema", () => {
  it("parses a valid analysis response", () => {
    expect(buildingAnalysisSchema.parse(mockBuildingAnalysis).schemaVersion).toBe(1);
  });

  it.each([
    { imageQualityReason: "The image is clear." },
    { buildingUse: "Residential" },
    { classificationReason: "The building is located in a natural environment." },
    { classificationReason: "자연 근처 건물입니다. Large glass panels are visible." },
    { riskFactors: ["Large glass panels", "넓은 창문"] },
    { environmentTags: ["Residential"] },
    { analyzedEvidence: ["High transparency and reflection"] },
    { designConsiderations: ["Apply grid patterns"] },
    { caution: "Immediate application of grid patterns is recommended." },
    { estimatedFloorCount: { ...mockBuildingAnalysis.estimatedFloorCount, explanation: "Estimated from visible windows." } },
    { glassRegions: [{ ...mockBuildingAnalysis.glassRegions[0], label: "Front window" }] },
  ])("rejects English display text: %j", (fields) => {
    expect(buildingAnalysisSchema.safeParse({ ...mockBuildingAnalysis, ...fields }).success).toBe(false);
  });

  it("allows Korean explanations with measurement units and technical abbreviations", () => {
    const analysis = {
      ...mockBuildingAnalysis,
      caution: "AI 추정 결과입니다. 가로 10cm, 세로 5cm 이하의 간격을 유지하고 UV 코팅을 확인하세요.",
      analyzedEvidence: ["유리 면적은 약 1m², 창틀 폭은 약 20mm로 추정됩니다."],
    };
    expect(buildingAnalysisSchema.parse(analysis)).toEqual(analysis);
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

  it("rejects glass mask coordinates outside the normalized image", () => {
    expect(() =>
      buildingAnalysisSchema.parse({
        ...mockBuildingAnalysis,
        glassRegions: [{ label: "유리창", confidence: 80, polygon: [[0, 0], [1001, 0], [0, 100]] }],
      }),
    ).toThrow();
  });
});

import { existsSync } from "fs";
import { join } from "path";

import { describe, expect, it } from "vitest";

import { mockBuildingAnalysis } from "@/mocks/building-analysis";
import { buildingAnalysisSchema } from "@/schemas/analysis";

describe("demo mode assets", () => {
  it("provides a valid mock analysis response", () => {
    const parsed = buildingAnalysisSchema.parse(mockBuildingAnalysis);
    expect(parsed.primaryCategory).toBe("university");
  });

  it("provides a mock sticker asset", () => {
    expect(
      existsSync(join(process.cwd(), "public", "mock", "sticker-result.svg")),
    ).toBe(true);
  });
});

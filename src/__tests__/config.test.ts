import { describe, expect, it } from "vitest";

import { buildingCategories, buildingCategoryIds } from "@/config/categories";
import { geminiConfig } from "@/config/gemini";
import { stickerRules } from "@/config/sticker-rules";

describe("BirdGuard configuration", () => {
  it("supports exactly 8 building categories", () => {
    expect(buildingCategories).toHaveLength(8);
    expect(buildingCategoryIds).toHaveLength(8);
  });

  it("contains the other category", () => {
    expect(buildingCategoryIds).toContain("other");
  });

  it("does not duplicate category IDs", () => {
    expect(new Set(buildingCategoryIds).size).toBe(buildingCategoryIds.length);
  });

  it("has one StickerRule for every category", () => {
    expect(Object.keys(stickerRules).sort()).toEqual([...buildingCategoryIds].sort());
  });

  it("uses the requested low-cost image generation settings", () => {
    expect(geminiConfig.imageModel).toBe("gemini-3.1-flash-lite-image");
    expect(geminiConfig.imageSize).toBe("1K");
    expect(geminiConfig.maxImageGenerationAttempts).toBe(1);
  });
});

import { describe, expect, it } from "vitest";

import { buildDesignExplanation } from "@/lib/build-design-explanation";
import { hasAutomaticPremiumFallback, buildStickerPrompt } from "@/lib/prompts/build-sticker-prompt";
import { buildClassificationPrompt } from "@/lib/prompts/build-classification-prompt";
import { mockBuildingAnalysis } from "@/mocks/building-analysis";

describe("prompt builders", () => {
  it("builds a classification prompt without reference images", () => {
    const prompt = buildClassificationPrompt();
    expect(prompt).toContain("현재 참고 이미지 manifest");
    expect(prompt).toContain("primaryCategory");
  });

  it("reflects final category, custom request, forbidden elements, and 1K size", () => {
    const prompt = buildStickerPrompt({
      analysis: mockBuildingAnalysis,
      selectedCategory: "near-nature",
      customDesignRequest: "초록색 계열, 글자 없이 만들어주세요.",
    });

    expect(prompt).toContain("ID: near-nature");
    expect(prompt).toContain("초록색 계열");
    expect(prompt).toContain("건물 사진 위 합성");
    expect(prompt).toContain("해상도: 1K");
  });

  it("does not enable automatic premium fallback", () => {
    expect(hasAutomaticPremiumFallback()).toBe(false);
  });

  it("creates design explanation without an extra API call", () => {
    const explanation = buildDesignExplanation({
      analysis: mockBuildingAnalysis,
      initialCategory: "university",
      selectedCategory: "glass-facade",
      customDesignRequest: "나뭇잎 패턴",
    });

    expect(explanation.categoryLine).toContain("AI 최초 분류");
    expect(explanation.reason).toContain("나뭇잎 패턴");
    expect(explanation.conceptNote).toContain("추가 Gemini 설명 호출은 사용하지 않았습니다");
  });
});

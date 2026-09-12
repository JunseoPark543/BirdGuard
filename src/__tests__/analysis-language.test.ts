import { beforeEach, describe, expect, it, vi } from "vitest";

import { analyzeBuildingImage } from "@/lib/gemini/analyze-building";
import { mockBuildingAnalysis } from "@/mocks/building-analysis";

const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));
vi.mock("@/lib/gemini/client", () => ({
  createGeminiClient: () => ({ models: { generateContent } }),
}));

const input = { buffer: Buffer.from("mock-image"), mimeType: "image/png" };
const englishResponse = { text: JSON.stringify({ ...mockBuildingAnalysis, buildingUse: "Residential" }) };

describe("Korean analysis responses", () => {
  beforeEach(() => generateContent.mockReset());

  it("returns Korean analysis without an additional request", async () => {
    generateContent.mockResolvedValue({ text: JSON.stringify(mockBuildingAnalysis) });
    await expect(analyzeBuildingImage(input)).resolves.toEqual(mockBuildingAnalysis);
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it("retries English output and returns the validated Korean response", async () => {
    generateContent.mockResolvedValueOnce(englishResponse)
      .mockResolvedValueOnce({ text: JSON.stringify(mockBuildingAnalysis) });
    await expect(analyzeBuildingImage(input)).resolves.toEqual(mockBuildingAnalysis);
    expect(generateContent).toHaveBeenCalledTimes(2);
    expect(generateContent.mock.calls[1][0].contents[0].parts[0].text).toContain("수정할 항목: buildingUse");
  });

  it("returns a Korean error when repeated responses still contain English", async () => {
    generateContent.mockResolvedValue(englishResponse);
    await expect(analyzeBuildingImage(input)).rejects.toMatchObject({
      code: "GEMINI_PARSE",
      safeMessage: expect.stringContaining("건물 분석 결과를 처리하지 못했습니다"),
    });
    expect(generateContent).toHaveBeenCalledTimes(2);
  });
});

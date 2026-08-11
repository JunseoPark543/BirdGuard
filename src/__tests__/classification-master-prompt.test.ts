import { describe, expect, it } from "vitest";

import { buildClassificationPrompt } from "@/lib/prompts/build-classification-prompt";

describe("MASTER classification context", () => {
  it("includes the DOCX-derived rules in every image analysis prompt", () => {
    const prompt = buildClassificationPrompt();

    expect(prompt).toContain("# 건물 분류 조건 MASTER");
    expect(prompt).toContain("단일 유리 패널 면적 1m² 미만");
    expect(prompt).toContain("맹금류 실루엣 스티커");
    expect(prompt).toContain("가로 10cm 이하, 세로 5cm 이하");
    expect(prompt).toContain("`critical`은 MASTER 문서에 정의된 등급이 아니므로 사용하지 않는다");
  });
});

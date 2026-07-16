import { getCategoryConfig } from "@/config/categories";
import { geminiConfig } from "@/config/gemini";
import { getStickerRule, globalStickerRules } from "@/config/sticker-rules";
import type { BuildingAnalysis, BuildingCategoryId } from "@/types/birdguard";

export type BuildStickerPromptInput = {
  analysis: BuildingAnalysis;
  selectedCategory: BuildingCategoryId;
  customDesignRequest: string;
};

export function buildStickerPrompt({
  analysis,
  selectedCategory,
  customDesignRequest,
}: BuildStickerPromptInput) {
  const category = getCategoryConfig(selectedCategory);
  const rule = getStickerRule(selectedCategory);

  return `
조류 충돌 방지 창문 스티커의 독립 디자인 도안 1장을 생성한다.

[출력 형식]
- 모드: ${globalStickerRules.outputMode}
- 비율: ${globalStickerRules.aspectRatio}
- 해상도: ${geminiConfig.imageSize}
- 한 요청에서 이미지 1장만 생성
- 제품 목업이 아닌 정사각형 그래픽 도안
- 건물 사진 위 합성 금지
- 창문 프레임, 포장, 손, 설치 장면 금지
- 요청하지 않은 글자 삽입 금지

[최종 선택 카테고리]
- ID: ${selectedCategory}
- 표시명: ${category.labelKo}
- 설명: ${category.description}

[사진 분석 요약]
- AI 최초 대표 분류: ${analysis.primaryCategory}
- 분류 근거: ${analysis.classificationReason}
- 창문 크기: ${analysis.windowSize}
- 유리 반사도: ${analysis.glassReflectivity}
- 주변 식생: ${analysis.nearbyVegetation}
- 하늘 반사: ${analysis.skyReflection}
- 조류 충돌 위험도: ${analysis.birdCollisionRisk}
- 위험 요인: ${analysis.riskFactors.join(", ") || "없음"}
- 디자인 반영 요소: ${analysis.designConsiderations.join(", ") || "없음"}

[카테고리별 디자인 규칙]
- 컨셉: ${rule.conceptName}
- 모티프: ${rule.motifs.join(", ")}
- 구성: ${rule.composition.join(", ")}
- 팔레트: ${rule.palette.join(", ")}
- 밀도: ${rule.patternDensity}
- 요소 크기: ${rule.elementSize}
- 간격: ${rule.spacing}
- 배경: ${rule.background}
- 타일형 패턴: ${rule.tileable ? "예" : "아니오"}
- 텍스트 포함: ${rule.includeText ? "예" : "아니오"}
- 필수 요소: ${rule.requiredElements.join(", ")}
- 금지 요소: ${rule.forbiddenElements.join(", ")}
- 추가 방향: ${rule.additionalPrompt}

[사용자 추가 조건]
${customDesignRequest.trim() || "사용자 추가 조건 없음"}

[안전 및 품질 지시]
검증되지 않은 충돌 감소율, 실제 규격, 인증 문구를 만들지 않는다.
조류 충돌 방지 스티커 컨셉 시안으로 보이게 한다.
시각 요소는 선명하고 반복 가능해야 하며, 지나치게 복잡한 목업처럼 만들지 않는다.
`.trim();
}

export function hasAutomaticPremiumFallback() {
  return false;
}

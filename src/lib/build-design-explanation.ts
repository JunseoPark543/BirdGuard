import { getCategoryConfig } from "@/config/categories";
import { getStickerRule } from "@/config/sticker-rules";
import type { BuildingAnalysis, BuildingCategoryId } from "@/types/birdguard";
import type { StickerRecommendation } from "@/lib/recommend-stickers";
import { designPreviewNotice } from "@/config/sticker-catalog";

export type DesignExplanation = {
  summary: string;
  categoryLine: string;
  reflectedFactors: string[];
  reason: string;
  conceptNote: string;
};

export function buildDesignExplanation({
  analysis,
  initialCategory,
  selectedCategory,
  customDesignRequest,
  recommendation,
}: {
  analysis: BuildingAnalysis;
  initialCategory: BuildingCategoryId;
  selectedCategory: BuildingCategoryId;
  customDesignRequest: string;
  recommendation?: StickerRecommendation;
}): DesignExplanation {
  const selectedConfig = getCategoryConfig(selectedCategory);
  const initialConfig = getCategoryConfig(initialCategory);
  const rule = getStickerRule(selectedCategory);
  const categoryChanged = initialCategory !== selectedCategory;
  if (recommendation) {
    return {
      summary: `${recommendation.label} · ${recommendation.title}을 선택했습니다.`,
      categoryLine: `AI 최초 분류: ${initialConfig.labelKo} / 최종 선택 분류: ${selectedConfig.labelKo}`,
      reflectedFactors: recommendation.reasons,
      reason: `마감 제안: ${recommendation.finish}. ${designPreviewNotice}`,
      conceptNote: `디자인 조합: ${recommendation.id}. 제공된 SVG 원본으로 구성한 미리보기입니다.`,
    };
  }
  const riskFactors = analysis.riskFactors.slice(0, 3);
  const designFactors = analysis.designConsiderations.slice(0, 3);
  const reflectedFactors = [...riskFactors, ...designFactors].slice(0, 5);

  return {
    summary: `${selectedConfig.labelKo} 환경에 맞춰 ${rule.conceptName} 방향의 컨셉 시안을 만들었습니다.`,
    categoryLine: categoryChanged
      ? `AI 최초 분류: ${initialConfig.labelKo} / 최종 선택 분류: ${selectedConfig.labelKo}`
      : `AI 최초 분류와 최종 선택 분류: ${selectedConfig.labelKo}`,
    reflectedFactors,
    reason: [
      `${analysis.classificationReason}`,
      `주요 위험 요소로 ${riskFactors.join(", ") || "사진 기반 위험 요소"}가 반영되었습니다.`,
      customDesignRequest
        ? `사용자 추가 조건인 "${customDesignRequest}"도 프롬프트에 포함했습니다.`
        : "사용자 추가 조건은 입력되지 않았습니다.",
    ].join(" "),
    conceptNote:
      "디자인 설명은 분석 JSON과 설정 파일을 조합해 로컬 코드에서 생성했습니다. 추가 Gemini 설명 호출은 사용하지 않았습니다.",
  };
}

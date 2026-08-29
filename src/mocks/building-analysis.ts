import type { BuildingAnalysis } from "@/types/birdguard";

export const mockBuildingAnalysis: BuildingAnalysis = {
  schemaVersion: 1,
  isRelevantPhoto: true,
  imageQuality: "good",
  imageQualityReason: "건물 입면과 창문 구조가 비교적 선명하게 보입니다.",
  primaryCategory: "university",
  secondaryCategories: [
    { category: "glass-facade", confidence: 62 },
    { category: "near-nature", confidence: 58 },
  ],
  classificationConfidence: 76,
  classificationReason:
    "캠퍼스 건물로 보이는 외관과 반복 창문, 주변 녹지가 함께 확인됩니다.",
  buildingUse: "교육 시설 또는 공공 건물로 추정됩니다.",
  windowSize: "large",
  glassReflectivity: "medium",
  nearbyVegetation: "some",
  skyReflection: "medium",
  estimatedFloorCount: {
    min: 3,
    max: 5,
    explanation: "사진에 보이는 창문 배열을 기준으로 한 대략적인 추정입니다.",
  },
  birdCollisionRisk: "high",
  riskFactors: [
    "넓은 유리 면",
    "하늘과 주변 녹지 반사",
    "반복되는 창문 패턴",
  ],
  environmentTags: ["캠퍼스", "큰 창문", "주변 식생", "중간 반사"],
  analyzedEvidence: [
    "창문이 넓고 반복적으로 배치되어 있습니다.",
    "유리 면에 외부 환경이 일부 반사됩니다.",
    "건물 주변에 나무와 녹지가 보입니다.",
  ],
  designConsiderations: [
    "반복 가능한 잎 모티프",
    "넓은 유리면을 분절하는 패턴",
    "캠퍼스 분위기에 맞는 차분한 색상",
  ],
  glassRegions: [
    {
      label: "건물 전면의 넓은 유리창 영역",
      confidence: 88,
      polygon: [
        [190, 245], [500, 105], [820, 285], [810, 790],
        [515, 850], [205, 745],
      ],
    },
  ],
  caution:
    "이 결과는 데모 모드의 샘플 분석이며 실제 AI 분석이나 현장 조사 결과가 아닙니다.",
};

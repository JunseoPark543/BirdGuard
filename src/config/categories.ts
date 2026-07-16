import type { BuildingCategoryId } from "@/types/birdguard";

export type BuildingCategoryConfig = {
  id: BuildingCategoryId;
  labelKo: string;
  labelEn: string;
  description: string;
  priority: number;
  visualCues: string[];
  negativeCues: string[];
  referenceImagePaths: string[];
  enabled: boolean;
};

export const buildingCategoryIds = [
  "commercial",
  "transparent-barrier",
  "glass-facade",
  "university",
  "near-nature",
  "residential",
  "special",
  "other",
] as const satisfies readonly BuildingCategoryId[];

export const buildingCategories: readonly BuildingCategoryConfig[] = [
  {
    id: "commercial",
    labelKo: "상가",
    labelEn: "Commercial",
    description: "가게, 간판, 1층 점포가 함께 보일 수 있는 건물",
    priority: 40,
    visualCues: ["저층 상업 공간", "큰 전면 유리", "출입문과 진열창"],
    negativeCues: ["명확한 주거용 발코니 중심", "캠퍼스 안내 표지 중심"],
    referenceImagePaths: ["/reference-images/commercial"],
    enabled: true,
  },
  {
    id: "transparent-barrier",
    labelKo: "투명 방벽",
    labelEn: "Transparent barrier",
    description: "방음벽, 난간, 버스정류장처럼 투명 판이 주요 대상인 구조물",
    priority: 20,
    visualCues: ["독립된 투명 패널", "반복되는 지지대", "건물보다 방벽이 중심"],
    negativeCues: ["창문이 달린 건물 입면이 중심", "실내 상업 공간이 중심"],
    referenceImagePaths: ["/reference-images/transparent-barrier"],
    enabled: true,
  },
  {
    id: "glass-facade",
    labelKo: "통유리창",
    labelEn: "Glass facade",
    description: "넓은 유리 면과 강한 반사가 두드러지는 건물 입면",
    priority: 30,
    visualCues: ["큰 유리 면", "반사되는 하늘", "반복 창호 패턴"],
    negativeCues: ["유리보다 벽면이 훨씬 넓음", "주요 대상이 방벽임"],
    referenceImagePaths: ["/reference-images/glass-facade"],
    enabled: true,
  },
  {
    id: "university",
    labelKo: "대학교 건물",
    labelEn: "University building",
    description: "캠퍼스 건물로 추정되는 교육 시설",
    priority: 50,
    visualCues: ["캠퍼스 표지", "교육 시설 분위기", "넓은 보행 공간"],
    negativeCues: ["상점 간판이 주된 정보", "단독 주거지로 보임"],
    referenceImagePaths: ["/reference-images/university"],
    enabled: true,
  },
  {
    id: "near-nature",
    labelKo: "자연 근처 건물",
    labelEn: "Near nature",
    description: "나무, 숲, 하천 등 자연 요소가 가까운 건물",
    priority: 60,
    visualCues: ["건물 가까운 나무", "짙은 식생", "하늘과 수목 반사"],
    negativeCues: ["주변 식생이 거의 없음", "실내 사진처럼 보임"],
    referenceImagePaths: ["/reference-images/near-nature"],
    enabled: true,
  },
  {
    id: "residential",
    labelKo: "주거지",
    labelEn: "Residential",
    description: "아파트, 빌라, 주택처럼 생활 공간으로 보이는 건물",
    priority: 70,
    visualCues: ["발코니", "세대별 반복 창문", "주거용 외관"],
    negativeCues: ["상업 간판이 중심", "공공 교육 시설 표지가 명확"],
    referenceImagePaths: ["/reference-images/residential"],
    enabled: true,
  },
  {
    id: "special",
    labelKo: "특수 건물",
    labelEn: "Special facility",
    description: "운영자가 별도로 정의할 필요가 있는 특수 시설",
    priority: 80,
    // TODO: 해커톤 이후 실제 운영 기준에 맞춰 특수 건물 정의를 구체화한다.
    visualCues: ["일반 분류로 설명하기 어려운 외관", "특수 목적 시설로 보이는 단서"],
    negativeCues: ["상가, 주거지, 캠퍼스 등 일반 분류가 더 명확함"],
    referenceImagePaths: ["/reference-images/special"],
    enabled: true,
  },
  {
    id: "other",
    labelKo: "기타",
    labelEn: "Other",
    description: "정확한 분류가 어렵거나 어떤 카테고리에도 명확히 맞지 않는 경우",
    priority: 100,
    visualCues: ["판단 근거가 부족함", "카테고리 경계가 모호함"],
    negativeCues: ["다른 카테고리에 해당하는 명확한 단서가 있음"],
    referenceImagePaths: ["/reference-images/other"],
    enabled: true,
  },
] as const;

export const categoryById = Object.fromEntries(
  buildingCategories.map((category) => [category.id, category]),
) as Record<BuildingCategoryId, BuildingCategoryConfig>;

export function isBuildingCategoryId(value: unknown): value is BuildingCategoryId {
  return (
    typeof value === "string" &&
    buildingCategoryIds.includes(value as BuildingCategoryId)
  );
}

export function getCategoryConfig(id: BuildingCategoryId) {
  return categoryById[id];
}

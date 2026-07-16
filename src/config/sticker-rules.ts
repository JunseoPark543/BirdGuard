import type { BuildingCategoryId, GenerationMode } from "@/types/birdguard";

export type StickerRule = {
  categoryId: BuildingCategoryId;
  enabled: boolean;
  conceptName: string;
  motifs: string[];
  composition: string[];
  palette: string[];
  patternDensity: string;
  elementSize: string;
  spacing: string;
  background: string;
  tileable: boolean;
  includeText: boolean;
  requiredElements: string[];
  forbiddenElements: string[];
  additionalPrompt: string;
  safetyNote: string;
};

export type GlobalStickerRules = {
  outputMode: Extract<GenerationMode, "sticker-design">;
  aspectRatio: "1:1";
  resolution: "1K";
  background: string;
  noBuildingMockup: boolean;
  noPackagingMockup: boolean;
  noWindowFrame: boolean;
  noHands: boolean;
  noUnrequestedText: boolean;
  conceptOnlyDisclaimer: string;
};

export const globalStickerRules: GlobalStickerRules = {
  outputMode: "sticker-design",
  aspectRatio: "1:1",
  resolution: "1K",
  background: "밝은 단색 또는 투명 배경처럼 보이는 단순 배경",
  noBuildingMockup: true,
  noPackagingMockup: true,
  noWindowFrame: true,
  noHands: true,
  noUnrequestedText: true,
  conceptOnlyDisclaimer:
    "운영자가 설정한 규격 없음. 결과는 조류 충돌 방지 스티커의 컨셉 시안입니다.",
};

const baseForbiddenElements = [
  "건물 사진 위 합성",
  "제품 포장 목업",
  "창틀 목업",
  "사람 손",
  "요청하지 않은 글자",
  "충돌 감소율 같은 검증되지 않은 수치",
];

export const stickerRules: Record<BuildingCategoryId, StickerRule> = {
  commercial: {
    categoryId: "commercial",
    enabled: true,
    conceptName: "상업가로 저채도 리듬 패턴",
    motifs: ["작은 잎", "부드러운 점", "짧은 곡선"],
    composition: ["반복 패턴", "시야를 완전히 막지 않는 균형", "중앙 집중 없는 구성"],
    palette: ["딥그린", "세이지", "오프화이트", "차분한 노랑 포인트"],
    patternDensity: "운영자가 설정한 규격 없음",
    elementSize: "운영자가 설정한 규격 없음",
    spacing: "운영자가 설정한 규격 없음",
    background: "밝고 깨끗한 배경",
    tileable: true,
    includeText: false,
    requiredElements: ["반복 가능한 그래픽 요소", "창문 가시성을 고려한 여백"],
    forbiddenElements: baseForbiddenElements,
    additionalPrompt: "상가 유리면에 어울리는 차분한 공공 디자인 느낌",
    safetyNote: "실제 부착 간격과 면적은 현장 기준으로 별도 검토해야 합니다.",
  },
  "transparent-barrier": {
    categoryId: "transparent-barrier",
    enabled: true,
    conceptName: "투명 방벽용 선형 흐름 패턴",
    motifs: ["유선형 선", "작은 원형 마커", "가벼운 잎맥"],
    composition: ["수평 반복", "멀리서도 보이는 리듬", "패널 경계를 넘는 연결감"],
    palette: ["포레스트 그린", "화이트", "밝은 청록", "연한 회색"],
    patternDensity: "운영자가 설정한 규격 없음",
    elementSize: "운영자가 설정한 규격 없음",
    spacing: "운영자가 설정한 규격 없음",
    background: "단순하고 밝은 배경",
    tileable: true,
    includeText: false,
    requiredElements: ["방향성 있는 선", "반복 가능한 시각 신호"],
    forbiddenElements: baseForbiddenElements,
    additionalPrompt: "방음벽이나 난간 같은 긴 투명 구조물에 맞는 흐름감",
    safetyNote: "방벽 구조와 규격에 맞는 실제 시공 검토가 필요합니다.",
  },
  "glass-facade": {
    categoryId: "glass-facade",
    enabled: true,
    conceptName: "통유리 반사 완화 패턴",
    motifs: ["큰 잎 실루엣", "반투명 원", "짧은 사선"],
    composition: ["중간 이상 밀도", "반사면을 끊는 반복", "정사각형 도안"],
    palette: ["에버그린", "민트", "오프화이트", "어두운 청록"],
    patternDensity: "운영자가 설정한 규격 없음",
    elementSize: "운영자가 설정한 규격 없음",
    spacing: "운영자가 설정한 규격 없음",
    background: "밝은 배경",
    tileable: true,
    includeText: false,
    requiredElements: ["넓은 유리면에 반복될 수 있는 패턴", "반사 영역을 분절하는 요소"],
    forbiddenElements: baseForbiddenElements,
    additionalPrompt: "넓은 유리 입면의 강한 반사를 고려한 명확한 시각 패턴",
    safetyNote: "실제 반사도와 방향은 현장 확인이 필요합니다.",
  },
  university: {
    categoryId: "university",
    enabled: true,
    conceptName: "캠퍼스 생태 패턴",
    motifs: ["나뭇잎", "새의 움직임을 암시하는 추상 선", "작은 씨앗 모양"],
    composition: ["질서 있는 격자", "공공시설에 맞는 단정함", "과하지 않은 포인트"],
    palette: ["캠퍼스 그린", "오프화이트", "밝은 블루", "차분한 회색"],
    patternDensity: "운영자가 설정한 규격 없음",
    elementSize: "운영자가 설정한 규격 없음",
    spacing: "운영자가 설정한 규격 없음",
    background: "깨끗한 밝은 배경",
    tileable: true,
    includeText: false,
    requiredElements: ["교육 시설에 어울리는 정돈된 패턴", "자연 요소"],
    forbiddenElements: baseForbiddenElements,
    additionalPrompt: "대학교 캠퍼스의 공공성과 자연 친화성을 함께 반영",
    safetyNote: "캠퍼스 디자인 가이드가 있다면 별도 반영해야 합니다.",
  },
  "near-nature": {
    categoryId: "near-nature",
    enabled: true,
    conceptName: "수목 반사 대응 자연 패턴",
    motifs: ["잎", "가지", "물결", "작은 열매"],
    composition: ["자연스러운 반복", "부분적으로 밀도가 다른 구성", "부드러운 흐름"],
    palette: ["딥그린", "라임 포인트", "오프화이트", "연한 하늘색"],
    patternDensity: "운영자가 설정한 규격 없음",
    elementSize: "운영자가 설정한 규격 없음",
    spacing: "운영자가 설정한 규격 없음",
    background: "밝고 자연스러운 배경",
    tileable: true,
    includeText: false,
    requiredElements: ["식생과 연결되는 시각 요소", "새가 유리면을 인지할 수 있는 반복"],
    forbiddenElements: baseForbiddenElements,
    additionalPrompt: "나무와 하늘 반사가 많은 환경에 어울리는 생태적 분위기",
    safetyNote: "주변 식생 변화와 계절성을 현장에서 확인해야 합니다.",
  },
  residential: {
    categoryId: "residential",
    enabled: true,
    conceptName: "주거지 저자극 패턴",
    motifs: ["작은 잎", "둥근 점", "부드러운 아치"],
    composition: ["차분한 반복", "시야 방해를 줄인 배치", "생활 공간에 맞는 부드러움"],
    palette: ["세이지 그린", "오프화이트", "연한 노랑", "따뜻한 회색"],
    patternDensity: "운영자가 설정한 규격 없음",
    elementSize: "운영자가 설정한 규격 없음",
    spacing: "운영자가 설정한 규격 없음",
    background: "밝은 단색 배경",
    tileable: true,
    includeText: false,
    requiredElements: ["부드러운 분위기", "반복 가능한 작은 요소"],
    forbiddenElements: baseForbiddenElements,
    additionalPrompt: "주거지에 어울리는 조용하고 부담 없는 디자인",
    safetyNote: "입주자 동의와 시야 확보 기준을 별도 검토해야 합니다.",
  },
  special: {
    categoryId: "special",
    enabled: true,
    conceptName: "특수 시설 기본 패턴",
    motifs: ["기하학적 점", "짧은 선", "중립적 자연 모티프"],
    composition: ["수정 가능한 기본 반복", "시설 성격을 과도하게 단정하지 않는 구성"],
    palette: ["딥그린", "화이트", "청록", "중립 회색"],
    patternDensity: "운영자가 설정한 규격 없음",
    elementSize: "운영자가 설정한 규격 없음",
    spacing: "운영자가 설정한 규격 없음",
    background: "밝은 배경",
    tileable: true,
    includeText: false,
    requiredElements: ["운영자가 수정하기 쉬운 중립 패턴"],
    forbiddenElements: baseForbiddenElements,
    additionalPrompt: "특수 건물 정의가 확정되지 않았으므로 중립적이고 수정 가능한 방향",
    safetyNote: "특수 시설 기준은 운영자가 별도로 정해야 합니다.",
  },
  other: {
    categoryId: "other",
    enabled: true,
    conceptName: "범용 조류 인지 패턴",
    motifs: ["원", "작은 잎", "짧은 선"],
    composition: ["범용 반복", "과도한 의미 부여 없는 구성", "정사각형 도안"],
    palette: ["그린", "화이트", "청록", "담청색"],
    patternDensity: "운영자가 설정한 규격 없음",
    elementSize: "운영자가 설정한 규격 없음",
    spacing: "운영자가 설정한 규격 없음",
    background: "밝은 배경",
    tileable: true,
    includeText: false,
    requiredElements: ["범용 반복 패턴", "명확한 시각 신호"],
    forbiddenElements: baseForbiddenElements,
    additionalPrompt: "분류가 어려운 사진에도 무난하게 적용할 수 있는 컨셉",
    safetyNote: "분류가 불확실하므로 실제 적용 전 현장 확인이 더 중요합니다.",
  },
};

export function getStickerRule(categoryId: BuildingCategoryId) {
  return stickerRules[categoryId];
}

import assets from "@/data/sticker-assets.json";

export const stickerFamilies = {
  round: "원·링", diamond: "마름모", bowtie: "보타이",
  seed: "씨앗·물방울", tile: "타일·픽셀", wing: "새·날개",
} as const;
export type StickerFamily = keyof typeof stickerFamilies;
export const stickerColors = {
  ivory: "아이보리", brown: "갈색", gray: "회색",
  green: "녹색", blue: "하늘색", orange: "주황색",
} as const;
export type StickerColor = keyof typeof stickerColors;
export type StickerAsset = {
  id: string; family: StickerFamily; variant: number; color: StickerColor;
  fileName: string; svg: string;
};
export const stickerCatalog = assets as StickerAsset[];
export function stickerDataUrl(asset: StickerAsset) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(asset.svg)}`;
}

export const spaceUses = {
  auto: "건물 분류 기준", cafe: "카페·음식점", retail: "상가·소매점",
  education: "도서관·교육시설", office: "사무실·공공시설", residential: "주거공간",
  healthcare: "병원·복지시설", children: "어린이시설", culture: "문화·전시시설",
  barrier: "투명 방음벽", other: "기타",
} as const;
export const facadeMaterials = {
  unknown: "잘 모르겠어요", concrete: "콘크리트", brick: "벽돌", stone: "석재",
  metal: "금속", wood: "목재", glass: "통유리·커튼월",
} as const;
export const buildingGeometries = {
  unknown: "잘 모르겠어요", straight: "직선형", curved: "곡선형", grid: "격자형 창틀",
} as const;
export const facadeTones = { unknown: "잘 모르겠어요", warm: "베이지·갈색 계열", cool: "회색·청색 계열" } as const;
export const visualComplexities = { unknown: "잘 모르겠어요", simple: "단순함", complex: "간판·진열물 등으로 복잡함" } as const;
export type StickerPreferences = {
  spaceUse: keyof typeof spaceUses;
  material: keyof typeof facadeMaterials;
  geometry: keyof typeof buildingGeometries;
  tone: keyof typeof facadeTones;
  complexity: keyof typeof visualComplexities;
  preferredColor: "auto" | StickerColor;
};
export const defaultStickerPreferences: StickerPreferences = {
  spaceUse: "auto", material: "unknown", geometry: "unknown", tone: "unknown",
  complexity: "unknown", preferredColor: "auto",
};

// Available equivalents only; leaf/node/etc. assets have not been delivered yet.
export const useMotifs: Record<Exclude<StickerPreferences["spaceUse"], "auto">, StickerFamily[]> = {
  cafe: ["seed", "tile", "round"], retail: ["tile", "bowtie", "diamond"],
  education: ["seed", "diamond", "round"], office: ["diamond", "bowtie", "tile"],
  residential: ["seed", "round", "bowtie"], healthcare: ["seed", "round", "bowtie"],
  children: ["seed", "round", "tile"], culture: ["tile", "bowtie", "seed"],
  barrier: ["wing", "seed", "diamond"], other: ["round", "diamond", "bowtie"],
};
// Document weights for attributes available in this version. Material determines finish
// directly; unavailable measured colors/production data are not assigned made-up scores.
export const recommendationWeights = { color: 25, geometry: 15, environment: 15, use: 10, preference: 10 };
export const designPreviewNotice = "실제 간격이 아닌 디자인 미리보기입니다. 시공 간격·수량·견적은 유리 실측과 배열 검수 후 확정됩니다.";

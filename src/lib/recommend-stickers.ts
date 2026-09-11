import {
  defaultStickerPreferences, recommendationWeights as weights, stickerCatalog,
  stickerColors, stickerFamilies, spaceUses, useMotifs,
  type StickerAsset, type StickerFamily, type StickerPreferences,
} from "@/config/sticker-catalog";
import type { BuildingAnalysis, BuildingCategoryId } from "@/types/birdguard";

export type StickerRecommendation = {
  id: string; direction: "harmony" | "minimal" | "signature"; label: string;
  asset: StickerAsset; companion: StickerAsset; title: string; reasons: string[];
  finish: string; layout: "regular" | "dense"; layoutLabel: string;
  safetyValidated: false; productionReady: false;
};
const categoryUse: Record<BuildingCategoryId, Exclude<StickerPreferences["spaceUse"], "auto">> = {
  commercial: "retail", "transparent-barrier": "barrier", "glass-facade": "office",
  university: "education", "near-nature": "other", residential: "residential", special: "office", other: "other",
};
const angular: StickerFamily[] = ["diamond", "bowtie", "tile"];
const rounded: StickerFamily[] = ["seed", "round"];
const isSimple = (asset: StickerAsset) => asset.family === "diamond" || (asset.family === "round" && asset.variant === 1);

export function recommendStickers(analysis: BuildingAnalysis, category: BuildingCategoryId, preferences: StickerPreferences = defaultStickerPreferences): StickerRecommendation[] {
  const use = preferences.spaceUse === "auto" ? categoryUse[category] : preferences.spaceUse;
  const vegetation = analysis.nearbyVegetation === "dense" || (analysis.nearbyVegetation === "some" && analysis.glassReflectivity === "high") || category === "near-nature";
  const sky = analysis.skyReflection === "high";
  const dense = vegetation || sky || analysis.glassReflectivity === "high" || ["high", "critical"].includes(analysis.birdCollisionRisk) || category === "transparent-barrier" || use === "barrier";
  const warm = preferences.tone === "warm" || (preferences.tone === "unknown" && ["brick", "wood"].includes(preferences.material));
  const geometry = preferences.geometry !== "unknown" ? preferences.geometry : category === "glass-facade" ? "grid" : "unknown";
  const motifPriority = category === "near-nature" && preferences.spaceUse === "auto" ? ["seed", "wing", "diamond"] : useMotifs[use];
  const finish = ["concrete", "brick", "stone"].includes(preferences.material) ? "무광 샌드"
    : preferences.material === "metal" ? "메탈릭 무광"
    : preferences.material === "wood" ? "반투명 프로스트"
    : preferences.material === "glass" || category === "glass-facade" || use === "barrier" ? "고투명 UV 또는 메탈릭 무광"
    : "외벽 재질 확인 후 마감 선택";

  const ranked = stickerCatalog
    .filter(asset => !(vegetation && asset.color === "green") && !(sky && asset.color === "blue"))
    .filter(asset => preferences.complexity !== "complex" || isSimple(asset) || asset.family === "seed")
    .map(asset => {
      const preferredFamilies = geometry === "curved" ? rounded : geometry === "grid" ? ["bowtie", "tile", "diamond"] : geometry === "straight" ? angular : [];
      const priority = motifPriority.indexOf(asset.family);
      let score = asset.color === "ivory" ? weights.color : asset.color === "brown" && warm ? weights.color * .9 : asset.color === "gray" && !warm ? weights.color * .7 : 0;
      if (preferredFamilies.includes(asset.family)) score += weights.geometry;
      if (priority >= 0) score += weights.use * (1 - priority / 4);
      if (vegetation && ["seed", "wing"].includes(asset.family)) score += weights.environment;
      if (asset.color === preferences.preferredColor) score += weights.preference + weights.color;
      if (preferences.complexity === "complex" && isSimple(asset)) score += weights.geometry;
      // Prefer the simpler version unless a distinctive variant is requested below.
      score -= asset.variant - 1;
      return { asset, score };
    }).sort((a, b) => b.score - a.score || a.asset.id.localeCompare(b.asset.id, "en"));

  const picked: StickerFamily[] = [];
  const directions = ["harmony", "minimal", "signature"] as const;
  const labels = { harmony: "조화형", minimal: "미니멀형", signature: "시그니처형" };
  return directions.map(direction => {
    const candidates = ranked.filter(({ asset }) => !picked.includes(asset.family));
    const pool = direction === "minimal" ? candidates.filter(({ asset }) => isSimple(asset)) : candidates;
    const chosen = direction === "signature"
      ? [...candidates].sort((a, b) => (b.score + (isSimple(b.asset) ? 0 : 12)) - (a.score + (isSimple(a.asset) ? 0 : 12)))[0]
      : (pool[0] ?? candidates[0]);
    const asset = chosen.asset;
    picked.push(asset.family);
    // Delivered gray is light (#D9D9D9), not charcoal. Brown is the available dark
    // counterpart; keep original SVG colors and never claim an unavailable palette.
    const companionColor = asset.color === "ivory" || asset.color === "gray" ? "brown" : "ivory";
    const companion = stickerCatalog.find(item => item.family === asset.family && item.variant === asset.variant && item.color === companionColor)!;
    const reasons = [
      preferences.spaceUse === "auto" ? "건물 분류를 기본 기준으로 선택했습니다. 설치 공간 용도를 지정하면 해당 용도를 우선합니다." : `${spaceUses[use]}의 분위기에 맞춰 모티프를 선택했습니다.`,
      direction === "minimal" ? "단순한 기하 모티프로 장식을 줄이고, 다른 추천과 같은 반복 간격을 유지합니다."
        : geometry === "unknown" ? `${stickerFamilies[asset.family]} 모티프를 반복해 공간의 리듬을 표현합니다.`
        : `${geometry === "curved" ? "곡선" : geometry === "grid" ? "격자" : "직선"} 형태와 모티프의 조화를 고려했습니다.`,
      `${stickerColors[asset.color]}·${stickerColors[companion.color]} 원본을 함께 사용해 밝고 어두운 배경의 대비를 보완합니다.${vegetation ? " 식생 환경에서는 녹색 후보를 제외했습니다." : ""}${sky ? " 강한 하늘 반사에서는 하늘색 후보를 제외했습니다." : ""}`,
      dense ? "반사·식생 또는 위험도를 고려해 촘촘한 반복을 제안합니다. 실측 후 5×5cm 강화 배열 검토가 필요합니다." : "기본 반복을 제안합니다. 실측 후 가로 10cm·세로 5cm 이내의 실제 빈 공간을 검수해야 합니다.",
    ];
    if (preferences.preferredColor !== "auto" && ((vegetation && preferences.preferredColor === "green") || (sky && preferences.preferredColor === "blue"))) reasons.push("선호 색상이 반사 배경에 묻힐 수 있어 대비색을 우선했습니다.");
    return {
      id: `svg-v1-${direction}-${asset.id}-${companion.color}-${use}-${preferences.material}-${dense ? "dense" : "regular"}`,
      direction, label: labels[direction], asset, companion,
      title: `${stickerFamilies[asset.family]} ${asset.variant} · ${stickerColors[asset.color]}`,
      reasons, finish, layout: dense ? "dense" : "regular", layoutLabel: dense ? "촘촘한 반복" : "기본 반복",
      safetyValidated: false, productionReady: false,
    };
  });
}

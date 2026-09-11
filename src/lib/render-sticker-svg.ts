import { designPreviewNotice } from "@/config/sticker-catalog";
import type { StickerRecommendation } from "@/lib/recommend-stickers";

export function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]!);
}

// Relative preview units only. These values do not represent physical millimeters.
export function stickerPatternMarkup(recipe: StickerRecommendation, id = "sticker-pattern") {
  const width = recipe.layout === "dense" ? 60 : 100;
  const height = 60;
  const art = (svg: string, x: number) => `<svg x="${x}" y="0" width="${width}" height="${height}" viewBox="75 75 150 150">${svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "")}</svg>`;
  return `<pattern id="${escapeXml(id)}" width="${width * 2}" height="${height}" patternUnits="userSpaceOnUse">${art(recipe.asset.svg, 0)}${art(recipe.companion.svg, width)}</pattern>`;
}

export function renderStickerSvg(recipe: StickerRecommendation) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000"><title>${escapeXml(recipe.title)}</title><desc>${escapeXml(designPreviewNotice)}</desc><metadata>${escapeXml(JSON.stringify({ recipeId: recipe.id, assets: [recipe.asset.fileName, recipe.companion.fileName], finish: recipe.finish, safetyValidated: false, productionReady: false }))}</metadata><defs>${stickerPatternMarkup(recipe)}</defs><rect width="1000" height="1000" fill="url(#sticker-pattern)"/></svg>`;
}

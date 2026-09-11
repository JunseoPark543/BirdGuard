import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/generate/route";
import { buildingCategoryIds } from "@/config/categories";
import { defaultStickerPreferences, stickerCatalog } from "@/config/sticker-catalog";
import { recommendStickers } from "@/lib/recommend-stickers";
import { renderStickerSvg, stickerPatternMarkup } from "@/lib/render-sticker-svg";
import { buildDownloadFileName } from "@/lib/download-image";
import { mockBuildingAnalysis } from "@/mocks/building-analysis";

const calm = { ...mockBuildingAnalysis, nearbyVegetation: "none" as const, glassReflectivity: "low" as const, skyReflection: "low" as const, birdCollisionRisk: "low" as const };
describe("document-based SVG recommendations", () => {
  it("indexes every delivered SVG without altering the artwork", () => {
    const files = readdirSync("components").filter(file => file.endsWith(".svg")).sort();
    expect(stickerCatalog.map(asset => asset.fileName).sort()).toEqual(files);
    expect(new Set(stickerCatalog.map(asset => asset.id)).size).toBe(files.length);
    for (const asset of stickerCatalog) expect(asset.svg).toBe(readFileSync(join("components", asset.fileName), "utf8").replace(/\r\n/g, "\n").trim());
  });
  it("returns three reproducible, distinct families even with complex facades", () => {
    for (const category of buildingCategoryIds) for (const complexity of ["unknown", "complex"] as const) {
      const preferences = { ...defaultStickerPreferences, complexity };
      const recipes = recommendStickers(calm, category, preferences);
      expect(recipes.map(item => item.label)).toEqual(["조화형", "미니멀형", "시그니처형"]);
      expect(new Set(recipes.map(item => item.asset.family)).size).toBe(3);
      expect(recommendStickers(calm, category, preferences)).toEqual(recipes);
      expect(recipes.every(item => item.companion && !item.safetyValidated && !item.productionReady)).toBe(true);
    }
  });
  it("uses the selected space instead of inferred building use", () => {
    const office = recommendStickers(calm, "glass-facade");
    const hospital = recommendStickers(calm, "glass-facade", { ...defaultStickerPreferences, spaceUse: "healthcare", geometry: "curved" });
    expect(["bowtie", "diamond"]).toContain(office[0].asset.family);
    expect(hospital[0].asset.family).toBe("seed");
    expect(hospital[0].reasons[0]).toContain("병원·복지시설");
  });
  it("excludes green/blue in vegetation/sky conditions even when requested", () => {
    const analysis = { ...calm, nearbyVegetation: "dense" as const, skyReflection: "high" as const };
    for (const preferredColor of ["green", "blue"] as const) {
      const recipes = recommendStickers(analysis, "university", { ...defaultStickerPreferences, preferredColor });
      expect(recipes.every(item => !["green", "blue"].includes(item.asset.color))).toBe(true);
      expect(recipes.every(item => item.layout === "dense")).toBe(true);
      expect(recipes[0].reasons.join(" ")).toContain("선호 색상");
    }
  });
  it("uses simple motifs and a warm finish for a busy brick cafe", () => {
    const recipes = recommendStickers(calm, "commercial", { ...defaultStickerPreferences, spaceUse: "cafe", material: "brick", complexity: "complex" });
    expect(recipes.every(item => ["round", "diamond", "seed"].includes(item.asset.family))).toBe(true);
    expect(recipes.every(item => item.finish === "무광 샌드")).toBe(true);
  });
  it("keeps minimal spacing equal to the other directions", () => {
    for (const analysis of [calm, mockBuildingAnalysis]) {
      const recipes = recommendStickers(analysis, "university");
      expect(new Set(recipes.map(item => item.layout)).size).toBe(1);
      expect(new Set(recipes.map(item => stickerPatternMarkup(item).match(/width="(\d+)" height="(\d+)"/)?.[0])).size).toBe(1);
    }
  });
  it("downloads the selected original paths as a self-contained SVG preview", async () => {
    const selected = recommendStickers(calm, "commercial")[2];
    const response = await POST(new Request("http://localhost/api/generate", { method: "POST", body: JSON.stringify({ analysis: calm, selectedCategory: "commercial", generationMode: "sticker-design", selectedStickerId: selected.id }) }));
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("image/svg+xml");
    const svg = await response.text();
    expect(svg).toBe(renderStickerSvg(selected));
    expect(svg).toContain(selected.id);
    expect(svg).toContain(selected.asset.fileName);
    expect(svg).toContain("실제 간격이 아닌");
    expect(svg).not.toContain("<image");
    expect(buildDownloadFileName("commercial", new Date(2026, 8, 11), "svg")).toMatch(/\.svg$/);
  });
  it("rejects stale/tampered selections and invalid preferences", async () => {
    for (const patch of [{ selectedStickerId: "../../arbitrary.svg" }, { stickerPreferences: { ...defaultStickerPreferences, material: "invalid" } }]) {
      const response = await POST(new Request("http://localhost/api/generate", { method: "POST", body: JSON.stringify({ analysis: calm, selectedCategory: "commercial", generationMode: "sticker-design", ...patch }) }));
      expect(response.status).toBe(400);
    }
  });
});

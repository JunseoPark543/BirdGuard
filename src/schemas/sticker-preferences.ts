import { z } from "zod";
import { buildingGeometries, defaultStickerPreferences, facadeMaterials, facadeTones, spaceUses, stickerColors, visualComplexities } from "@/config/sticker-catalog";

export const stickerPreferencesSchema = z.object({
  spaceUse: z.enum(Object.keys(spaceUses) as [keyof typeof spaceUses, ...Array<keyof typeof spaceUses>]),
  material: z.enum(Object.keys(facadeMaterials) as [keyof typeof facadeMaterials, ...Array<keyof typeof facadeMaterials>]),
  geometry: z.enum(Object.keys(buildingGeometries) as [keyof typeof buildingGeometries, ...Array<keyof typeof buildingGeometries>]),
  tone: z.enum(Object.keys(facadeTones) as [keyof typeof facadeTones, ...Array<keyof typeof facadeTones>]),
  complexity: z.enum(Object.keys(visualComplexities) as [keyof typeof visualComplexities, ...Array<keyof typeof visualComplexities>]),
  preferredColor: z.enum(["auto", ...Object.keys(stickerColors) as Array<keyof typeof stickerColors>]),
}).default(defaultStickerPreferences);

import { z } from "zod";

import { appConfig } from "@/config/app";
import { buildingCategoryIdSchema, buildingAnalysisSchema } from "@/schemas/analysis";
import { stickerPreferencesSchema } from "@/schemas/sticker-preferences";

export const generationRequestSchema = z.object({
  analysis: buildingAnalysisSchema,
  selectedCategory: buildingCategoryIdSchema,
  customDesignRequest: z
    .string()
    .trim()
    .max(appConfig.maxCustomRequestLength)
    .default(""),
  generationMode: z.literal("sticker-design"),
  stickerPreferences: stickerPreferencesSchema,
  selectedStickerId: z.string().min(1).max(160).optional(),
});

export type GenerationRequestInput = z.infer<typeof generationRequestSchema>;

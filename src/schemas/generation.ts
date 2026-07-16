import { z } from "zod";

import { appConfig } from "@/config/app";
import { buildingCategoryIdSchema, buildingAnalysisSchema } from "@/schemas/analysis";

export const generationRequestSchema = z.object({
  analysis: buildingAnalysisSchema,
  selectedCategory: buildingCategoryIdSchema,
  customDesignRequest: z
    .string()
    .trim()
    .max(appConfig.maxCustomRequestLength)
    .default(""),
  generationMode: z.literal("sticker-design"),
});

export type GenerationRequestInput = z.infer<typeof generationRequestSchema>;

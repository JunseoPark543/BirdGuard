import { z } from "zod";

import { buildingCategoryIds } from "@/config/categories";

export const buildingCategoryIdSchema = z.enum(buildingCategoryIds);

const limitedKoreanText = z.string().trim().min(1).max(240);
const shortTextArray = z.array(limitedKoreanText).max(8);
const confidenceSchema = z.number().int().min(0).max(100);

export const buildingAnalysisSchema = z
  .object({
    schemaVersion: z.literal(1),
    isRelevantPhoto: z.boolean(),
    imageQuality: z.enum(["good", "usable", "poor"]),
    imageQualityReason: limitedKoreanText,
    primaryCategory: buildingCategoryIdSchema,
    secondaryCategories: z
      .array(
        z.object({
          category: buildingCategoryIdSchema,
          confidence: confidenceSchema,
        }),
      )
      .max(3),
    classificationConfidence: confidenceSchema,
    classificationReason: limitedKoreanText,
    buildingUse: limitedKoreanText,
    windowSize: z.enum(["small", "medium", "large", "mixed", "unknown"]),
    glassReflectivity: z.enum(["low", "medium", "high", "unknown"]),
    nearbyVegetation: z.enum(["none", "some", "dense", "unknown"]),
    skyReflection: z.enum(["low", "medium", "high", "unknown"]),
    estimatedFloorCount: z
      .object({
        min: z.number().int().min(0).nullable(),
        max: z.number().int().min(0).nullable(),
        explanation: limitedKoreanText,
      })
      .superRefine((value, context) => {
        if (value.min !== null && value.max !== null && value.max < value.min) {
          context.addIssue({
            code: "custom",
            message: "estimatedFloorCount.max must be greater than or equal to min",
            path: ["max"],
          });
        }
      }),
    birdCollisionRisk: z.enum([
      "low",
      "medium",
      "high",
      "critical",
      "unknown",
    ]),
    riskFactors: shortTextArray,
    environmentTags: z.array(z.string().trim().min(1).max(40)).max(8),
    analyzedEvidence: shortTextArray,
    designConsiderations: shortTextArray,
    caution: z.string().trim().min(1).max(320),
  })
  .superRefine((value, context) => {
    const secondaryIds = value.secondaryCategories.map((item) => item.category);
    if (secondaryIds.includes(value.primaryCategory)) {
      context.addIssue({
        code: "custom",
        message: "primaryCategory must not be repeated in secondaryCategories",
        path: ["secondaryCategories"],
      });
    }

    if (new Set(secondaryIds).size !== secondaryIds.length) {
      context.addIssue({
        code: "custom",
        message: "secondaryCategories must not contain duplicates",
        path: ["secondaryCategories"],
      });
    }
  });

export type BuildingAnalysisInput = z.infer<typeof buildingAnalysisSchema>;

export const geminiAnalysisJsonSchema = {
  type: "object",
  required: [
    "schemaVersion",
    "isRelevantPhoto",
    "imageQuality",
    "imageQualityReason",
    "primaryCategory",
    "secondaryCategories",
    "classificationConfidence",
    "classificationReason",
    "buildingUse",
    "windowSize",
    "glassReflectivity",
    "nearbyVegetation",
    "skyReflection",
    "estimatedFloorCount",
    "birdCollisionRisk",
    "riskFactors",
    "environmentTags",
    "analyzedEvidence",
    "designConsiderations",
    "caution",
  ],
  properties: {
    schemaVersion: { type: "number" },
    isRelevantPhoto: { type: "boolean" },
    imageQuality: { type: "string", enum: ["good", "usable", "poor"] },
    imageQualityReason: { type: "string" },
    primaryCategory: {
      type: "string",
      enum: [...buildingCategoryIds],
    },
    secondaryCategories: {
      type: "array",
      maxItems: "3",
      items: {
        type: "object",
        required: ["category", "confidence"],
        properties: {
          category: { type: "string", enum: [...buildingCategoryIds] },
          confidence: { type: "number" },
        },
      },
    },
    classificationConfidence: { type: "number" },
    classificationReason: { type: "string" },
    buildingUse: { type: "string" },
    windowSize: {
      type: "string",
      enum: ["small", "medium", "large", "mixed", "unknown"],
    },
    glassReflectivity: {
      type: "string",
      enum: ["low", "medium", "high", "unknown"],
    },
    nearbyVegetation: {
      type: "string",
      enum: ["none", "some", "dense", "unknown"],
    },
    skyReflection: {
      type: "string",
      enum: ["low", "medium", "high", "unknown"],
    },
    estimatedFloorCount: {
      type: "object",
      required: ["min", "max", "explanation"],
      properties: {
        min: { type: "number", nullable: true },
        max: { type: "number", nullable: true },
        explanation: { type: "string" },
      },
    },
    birdCollisionRisk: {
      type: "string",
      enum: ["low", "medium", "high", "critical", "unknown"],
    },
    riskFactors: { type: "array", items: { type: "string" } },
    environmentTags: { type: "array", items: { type: "string" } },
    analyzedEvidence: { type: "array", items: { type: "string" } },
    designConsiderations: { type: "array", items: { type: "string" } },
    caution: { type: "string" },
  },
} as const;

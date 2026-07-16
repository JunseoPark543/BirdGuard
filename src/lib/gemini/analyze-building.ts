import { geminiConfig } from "@/config/gemini";
import { AppError, mapGeminiError } from "@/lib/errors";
import { createGeminiClient } from "@/lib/gemini/client";
import { buildClassificationPrompt } from "@/lib/prompts/build-classification-prompt";
import {
  buildingAnalysisSchema,
  geminiAnalysisJsonSchema,
} from "@/schemas/analysis";
import type { BuildingAnalysis } from "@/types/birdguard";
import { ZodError } from "zod";

type AnalyzeBuildingInput = {
  buffer: Buffer;
  mimeType: string;
};

function extractText(response: unknown) {
  const text = (response as { text?: string }).text;
  if (typeof text === "string" && text.trim().length > 0) {
    return text;
  }

  return "";
}

function parseJsonObject(text: string) {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
  return JSON.parse(trimmed);
}

export async function analyzeBuildingImage({
  buffer,
  mimeType,
}: AnalyzeBuildingInput): Promise<BuildingAnalysis> {
  const ai = createGeminiClient();
  const imageData = buffer.toString("base64");
  const basePrompt = buildClassificationPrompt();
  let lastError: unknown;

  for (let attempt = 1; attempt <= geminiConfig.maxAnalysisAttempts; attempt += 1) {
    try {
      const prompt =
        attempt === 1
          ? basePrompt
          : `${basePrompt}\n\n이전 응답은 JSON 검증에 실패했다. 이번에는 지정된 JSON 객체만 정확히 반환한다.`;

      const response = await ai.models.generateContent({
        model: geminiConfig.classificationModel,
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: imageData,
                },
              },
            ],
          },
        ],
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: geminiAnalysisJsonSchema,
        },
      } as never);

      const parsed = parseJsonObject(extractText(response));
      return buildingAnalysisSchema.parse(parsed);
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof SyntaxError || lastError instanceof ZodError) {
    throw new AppError(
      "GEMINI_PARSE",
      "건물 분석 결과를 처리하지 못했습니다.\n다른 사진으로 다시 시도해주세요.",
      502,
    );
  }

  throw mapGeminiError(
    lastError,
    "건물 분석 요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.",
  );
}

import { geminiConfig } from "@/config/gemini";
import { AppError, mapGeminiError } from "@/lib/errors";
import { createGeminiClient } from "@/lib/gemini/client";
import { buildStickerPrompt } from "@/lib/prompts/build-sticker-prompt";
import type { BuildingAnalysis, BuildingCategoryId } from "@/types/birdguard";

type GenerateStickerInput = {
  analysis: BuildingAnalysis;
  selectedCategory: BuildingCategoryId;
  customDesignRequest: string;
};

type InlineImagePart = {
  inlineData?: {
    data?: string;
    mimeType?: string;
  };
};

export async function generateStickerImage({
  analysis,
  selectedCategory,
  customDesignRequest,
}: GenerateStickerInput) {
  const ai = createGeminiClient();
  const prompt = buildStickerPrompt({
    analysis,
    selectedCategory,
    customDesignRequest,
  });

  try {
    const response = await ai.models.generateContent({
      model: geminiConfig.imageModel,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        temperature: 0.7,
        candidateCount: 1,
        responseModalities: ["IMAGE"],
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: geminiConfig.imageSize,
        },
      },
    } as never);

    const candidates =
      (response as {
        candidates?: Array<{ content?: { parts?: InlineImagePart[] } }>;
      }).candidates ?? [];

    for (const candidate of candidates) {
      for (const part of candidate.content?.parts ?? []) {
        if (part.inlineData?.data) {
          return {
            buffer: Buffer.from(part.inlineData.data, "base64"),
            mimeType: part.inlineData.mimeType ?? "image/png",
          };
        }
      }
    }

    throw new AppError(
      "GEMINI_NO_IMAGE",
      "이미지 생성 결과에 이미지가 없습니다. 처음부터 다시 시도해주세요.",
      502,
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw mapGeminiError(
      error,
      "이미지 생성 요청을 처리하지 못했습니다.\nGemini API의 결제 설정과 모델 사용 권한을 확인해주세요.",
    );
  }
}

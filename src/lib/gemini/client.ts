import { GoogleGenAI } from "@google/genai";

import { AppError } from "@/lib/errors";

export function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new AppError(
      "MISSING_API_KEY",
      "Gemini API 키가 설정되지 않았습니다.\n.env.local 파일의 GEMINI_API_KEY를 확인해주세요.",
      500,
    );
  }

  return new GoogleGenAI({ apiKey });
}

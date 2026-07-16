export const geminiConfig = {
  classificationModel:
    process.env.GEMINI_CLASSIFICATION_MODEL ?? "gemini-3.1-flash-lite",
  imageModel:
    process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-lite-image",
  imageSize: process.env.GEMINI_IMAGE_SIZE ?? "1K",
  maxAnalysisAttempts: 2,
  maxImageGenerationAttempts: 1,
  mockGemini: process.env.MOCK_GEMINI !== "false",
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== "false",
} as const;

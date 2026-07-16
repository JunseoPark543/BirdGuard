export type AppErrorCode =
  | "NO_FILE"
  | "EMPTY_FILE"
  | "UNSUPPORTED_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "INVALID_IMAGE"
  | "NOT_RELEVANT"
  | "MISSING_API_KEY"
  | "GEMINI_AUTH"
  | "GEMINI_QUOTA"
  | "GEMINI_SAFETY"
  | "GEMINI_PARSE"
  | "GEMINI_NO_IMAGE"
  | "GEMINI_TIMEOUT"
  | "NETWORK"
  | "BAD_REQUEST"
  | "UNKNOWN";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly safeMessage: string;

  constructor(code: AppErrorCode, safeMessage: string, status = 400) {
    super(safeMessage);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.safeMessage = safeMessage;
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    console.error("[birdguard-api-error]", error.code);
    return Response.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.safeMessage,
        },
      },
      { status: error.status },
    );
  }

  console.error("[birdguard-api-error]", "UNKNOWN");
  return Response.json(
    {
      success: false,
      error: {
        code: "UNKNOWN",
        message: "알 수 없는 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      },
    },
    { status: 500 },
  );
}

export function mapGeminiError(error: unknown, fallbackMessage: string): AppError {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("api key") || message.includes("unauthenticated")) {
    return new AppError("GEMINI_AUTH", "Gemini API 인증에 실패했습니다.", 401);
  }

  if (message.includes("quota") || message.includes("rate")) {
    return new AppError(
      "GEMINI_QUOTA",
      "요청이 너무 많아 처리하지 못했습니다. 잠시 후 처음부터 다시 시도해주세요.",
      429,
    );
  }

  if (message.includes("safety") || message.includes("blocked")) {
    return new AppError(
      "GEMINI_SAFETY",
      "안전 정책에 따라 요청을 처리하지 못했습니다. 다른 사진으로 시도해주세요.",
      400,
    );
  }

  if (message.includes("timeout")) {
    return new AppError(
      "GEMINI_TIMEOUT",
      "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.",
      504,
    );
  }

  return new AppError("UNKNOWN", fallbackMessage, 500);
}

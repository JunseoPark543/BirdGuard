import { readFile } from "fs/promises";
import { join } from "path";

import { NextResponse } from "next/server";

import { geminiConfig } from "@/config/gemini";
import { AppError, toErrorResponse } from "@/lib/errors";
import { generateStickerImage } from "@/lib/gemini/generate-sticker";
import { generationRequestSchema } from "@/schemas/generation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = generationRequestSchema.safeParse(json);

    if (!parsed.success) {
      throw new AppError(
        "BAD_REQUEST",
        "이미지 생성 요청 형식이 올바르지 않습니다.",
        400,
      );
    }

    if (geminiConfig.mockGemini) {
      const mockImage = await readFile(
        join(process.cwd(), "public", "mock", "sticker-result.svg"),
      );

      return new NextResponse(mockImage, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": 'inline; filename="birdguard-sticker.svg"',
          "Cache-Control": "no-store",
        },
      });
    }

    const result = await generateStickerImage(parsed.data);

    return new NextResponse(result.buffer, {
      headers: {
        "Content-Type": result.mimeType,
        "Content-Disposition": 'inline; filename="birdguard-sticker.png"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

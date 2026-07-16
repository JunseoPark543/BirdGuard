import { NextResponse } from "next/server";

import { geminiConfig } from "@/config/gemini";
import { AppError, toErrorResponse } from "@/lib/errors";
import { validateImageFileMetadata } from "@/lib/file-validation";
import { analyzeBuildingImage } from "@/lib/gemini/analyze-building";
import { mockBuildingAnalysis } from "@/mocks/building-analysis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      throw new AppError("NO_FILE", "사진을 선택해주세요.", 400);
    }

    validateImageFileMetadata(image);

    const arrayBuffer = await image.arrayBuffer();
    if (arrayBuffer.byteLength <= 0) {
      throw new AppError("EMPTY_FILE", "비어 있는 파일은 업로드할 수 없습니다.", 400);
    }

    if (geminiConfig.mockGemini) {
      return NextResponse.json({
        success: true,
        data: mockBuildingAnalysis,
      });
    }

    const data = await analyzeBuildingImage({
      buffer: Buffer.from(arrayBuffer),
      mimeType: image.type,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { AppError, toErrorResponse } from "@/lib/errors";
import { recommendStickers } from "@/lib/recommend-stickers";
import { renderStickerSvg } from "@/lib/render-sticker-svg";
import { generationRequestSchema } from "@/schemas/generation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const parsed = generationRequestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new AppError("BAD_REQUEST", "디자인 요청 형식이 올바르지 않습니다.", 400);
    const { analysis, selectedCategory, stickerPreferences, selectedStickerId } = parsed.data;
    const recommendations = recommendStickers(analysis, selectedCategory, stickerPreferences);
    const selected = selectedStickerId ? recommendations.find(item => item.id === selectedStickerId) : recommendations[0];
    if (!selected) throw new AppError("BAD_REQUEST", "추천 조건이 바뀌었습니다. 디자인을 다시 선택해주세요.", 400);
    return new NextResponse(renderStickerSvg(selected), {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": 'inline; filename="birdguard-design-preview.svg"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

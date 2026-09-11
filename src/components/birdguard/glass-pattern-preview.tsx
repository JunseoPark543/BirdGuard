"use client";

import { ScanSearch } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { stickerPatternMarkup } from "@/lib/render-sticker-svg";
import type { StickerRecommendation } from "@/lib/recommend-stickers";
import type { GlassRegion } from "@/types/birdguard";

type Props = { imageUrl: string; regions: GlassRegion[]; recommendation: StickerRecommendation; alt: string };

export function GlassPatternPreview({ imageUrl, regions, recommendation, alt }: Props) {
  const [size, setSize] = useState({ width: 1000, height: 1000 });
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const patternId = `sticker-${id}`;
  const maskId = `glass-${id}`;
  useEffect(() => {
    const image = new Image();
    image.onload = () => setSize({ width: image.naturalWidth || 1000, height: image.naturalHeight || 1000 });
    image.src = imageUrl;
    return () => { image.onload = null; };
  }, [imageUrl]);
  // Same relative 1000-unit coordinate system as the downloadable preview.
  const height = size.height / size.width * 1000;
  const points = (region: GlassRegion) => region.polygon.map(([x, y]) => `${x},${y / 1000 * height}`).join(" ");
  return <div className="masked-preview">
    <svg viewBox={`0 0 1000 ${height}`} role="img" aria-label={alt} preserveAspectRatio="xMidYMid meet">
      <defs><clipPath id={maskId}>{regions.map((region, index) => <polygon key={index} points={points(region)} />)}</clipPath></defs>
      {/* Only the build-validated local SVG catalog, never user content. */}
      <defs dangerouslySetInnerHTML={{ __html: stickerPatternMarkup(recommendation, patternId) }} />
      <image href={imageUrl} width="1000" height={height} preserveAspectRatio="none" />
      {regions.length > 0 && <rect width="1000" height={height} clipPath={`url(#${maskId})`} fill={`url(#${patternId})`} />}
      {regions.map((region, index) => <polygon key={index} points={points(region)} fill="none" stroke="#55e1b0" strokeWidth="2" strokeDasharray="8 6" opacity=".8" />)}
    </svg>
    {regions.length === 0 && <div className="mask-empty"><ScanSearch /><b>유리 영역 확인 필요</b><span>사진에서 유리 면을 신뢰성 있게 찾지 못했습니다.</span></div>}
    {regions.length > 0 && <span className="mask-count">유리 영역 {regions.length}개 · 디자인 미리보기</span>}
  </div>;
}

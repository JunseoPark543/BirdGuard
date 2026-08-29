"use client";

import { ScanSearch } from "lucide-react";
import { useEffect, useState } from "react";
import type { GlassRegion } from "@/types/birdguard";

type PatternId = "dot" | "line" | "grid" | "mixed";
type Props = { imageUrl: string; regions: GlassRegion[]; pattern: PatternId; alt: string };

function PatternArtwork({ pattern, width, height }: { pattern: PatternId; width: number; height: number }) {
  const unit = Math.max(width, height) / 22;
  if (pattern === "dot") return <pattern id="glass-pattern" width={unit} height={unit * .72} patternUnits="userSpaceOnUse"><circle cx={unit / 2} cy={unit * .36} r={Math.max(2, unit * .1)} fill="#f8f1d5" /></pattern>;
  if (pattern === "line") return <pattern id="glass-pattern" width={unit * 1.2} height={unit} patternUnits="userSpaceOnUse"><rect x={unit * .54} width={Math.max(2, unit * .1)} height={unit} rx="2" fill="#f8f1d5" /></pattern>;
  if (pattern === "grid") return <pattern id="glass-pattern" width={unit * 1.25} height={unit * .75} patternUnits="userSpaceOnUse"><path d={`M 0 0 H ${unit * 1.25} M 0 0 V ${unit * .75}`} fill="none" stroke="#f8f1d5" strokeWidth={Math.max(2, unit * .07)} /></pattern>;
  return <pattern id="glass-pattern" width={unit * 1.5} height={unit} patternUnits="userSpaceOnUse"><circle cx={unit * .38} cy={unit * .3} r={Math.max(2, unit * .09)} fill="#f8f1d5" /><path d={`M ${unit} 0 V ${unit}`} stroke="#f8f1d5" strokeWidth={Math.max(2, unit * .08)} /></pattern>;
}

export function GlassPatternPreview({ imageUrl, regions, pattern, alt }: Props) {
  const [size, setSize] = useState({ width: 1000, height: 1000 });
  useEffect(() => {
    const image = new Image();
    image.onload = () => setSize({ width: image.naturalWidth || 1000, height: image.naturalHeight || 1000 });
    image.src = imageUrl;
    return () => { image.onload = null; };
  }, [imageUrl]);
  const points = (region: GlassRegion) => region.polygon.map(([x, y]) => `${x / 1000 * size.width},${y / 1000 * size.height}`).join(" ");

  return <div className="masked-preview">
    <svg viewBox={`0 0 ${size.width} ${size.height}`} role="img" aria-label={alt} preserveAspectRatio="xMidYMid meet">
      <defs>
        <clipPath id="glass-regions-mask">{regions.map((region, index) => <polygon key={`${region.label}-${index}`} points={points(region)} />)}</clipPath>
        <PatternArtwork pattern={pattern} width={size.width} height={size.height} />
      </defs>
      <image href={imageUrl} width={size.width} height={size.height} preserveAspectRatio="none" />
      {regions.length > 0 && <g clipPath="url(#glass-regions-mask)"><rect width={size.width} height={size.height} fill="#0d8761" opacity=".12" /><rect width={size.width} height={size.height} fill="url(#glass-pattern)" opacity=".95" /></g>}
      {regions.map((region, index) => <polygon key={`outline-${region.label}-${index}`} points={points(region)} fill="none" stroke="#55e1b0" strokeWidth={Math.max(2, size.width / 400)} strokeDasharray={`${size.width / 120} ${size.width / 180}`} opacity=".8" />)}
    </svg>
    {regions.length === 0 && <div className="mask-empty"><ScanSearch /><b>유리 영역 확인 필요</b><span>사진에서 유리 면을 신뢰성 있게 찾지 못했습니다.</span></div>}
    {regions.length > 0 && <span className="mask-count">유리 영역 {regions.length}개 인식</span>}
  </div>;
}

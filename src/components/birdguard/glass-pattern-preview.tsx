"use client";

import { Loader2, ScanSearch } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { WindowCornerPicker } from "@/components/birdguard/window-corner-picker";
import { extractWindowPlane, windowQuad, type Point } from "@/lib/rectify-window";
import { stickerPatternMarkup } from "@/lib/render-sticker-svg";
import type { StickerRecommendation } from "@/lib/recommend-stickers";
import type { GlassRegion } from "@/types/birdguard";

type Props = { imageUrl: string; regions: GlassRegion[]; recommendation: StickerRecommendation; alt: string };
type Plane = { key: string; url?: string; width?: number; height?: number; error?: string };

export function GlassPatternPreview({ imageUrl, regions, recommendation, alt }: Props) {
  const defaultIndex = useMemo(() => Math.max(0, regions.findIndex(region => windowQuad(region.polygon))), [regions]);
  const [regionChoice, setRegionChoice] = useState<string | null>(null);
  const [manualPolygon, setManualPolygon] = useState<Point[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [showStickers, setShowStickers] = useState(true);
  const [plane, setPlane] = useState<Plane | null>(null);
  const selectedValue = regionChoice ?? String(defaultIndex);
  const polygon = selectedValue === "manual" ? manualPolygon : regions[Number(selectedValue)]?.polygon;
  const valid = useMemo(() => polygon ? windowQuad(polygon) : null, [polygon]);
  const key = `${imageUrl}:${selectedValue}:${JSON.stringify(polygon)}`;
  const result = plane?.key === key ? plane : null;
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const patternId = `window-sticker-${id}`;
  const outlineId = `window-outline-${id}`;

  useEffect(() => {
    if (!polygon || !valid) return;
    let cancelled = false;
    let frame = 0;
    const image = new Image();
    image.onload = () => {
      frame = requestAnimationFrame(() => {
        if (cancelled) return;
        try {
          const extracted = extractWindowPlane(image, polygon);
          if (!cancelled) setPlane({ key, ...extracted });
        } catch (error) {
          if (!cancelled) setPlane({ key, error: error instanceof Error ? error.message : "창문을 추출하지 못했습니다." });
        }
      });
    };
    image.onerror = () => { if (!cancelled) setPlane({ key, error: "사진을 불러오지 못했습니다. 사진을 다시 선택해주세요." }); };
    image.src = imageUrl;
    return () => { cancelled = true; cancelAnimationFrame(frame); image.onload = null; image.onerror = null; };
  }, [imageUrl, polygon, valid, key]);

  const longestEdge = Math.max(result?.width ?? 1, result?.height ?? 1);
  const width = result?.width ? 1000 * result.width / longestEdge : 1000;
  const height = result?.height ? 1000 * result.height / longestEdge : 1000;
  return <section className="window-flat-preview" aria-label="창문 평면 미리보기">
    <div className="window-preview-heading"><div><small>WINDOW FLAT VIEW</small><h3>창문을 펼쳐서 보기</h3></div><span>위에서 내려다본 모습</span></div>
    <p className="recommendation-note">사진 속 유리창만 떼어 평평하게 펼쳤어요. 선택한 창문에서 스티커의 모양과 배치를 확인해보세요.</p>
    <div className="window-preview-controls">
      {(regions.length > 0 || manualPolygon) && <label>미리볼 창문<select value={selectedValue} onChange={event => setRegionChoice(event.target.value)}>
        {regions.map((region, index) => <option key={index} value={String(index)}>{index + 1}. {region.label}</option>)}
        {manualPolygon && <option value="manual">직접 선택한 창문</option>}
      </select></label>}
      <button type="button" className="window-edit-button" onClick={() => setEditing(value => !value)}>{editing ? "영역 선택 닫기" : "창문 영역 직접 선택"}</button>
    </div>
    {editing && <WindowCornerPicker imageUrl={imageUrl} onCancel={() => setEditing(false)} onApply={points => { setManualPolygon(points); setRegionChoice("manual"); setEditing(false); }} />}
    <div className="window-view-switch" role="group" aria-label="스티커 적용 비교">
      <button type="button" aria-pressed={!showStickers} onClick={() => setShowStickers(false)}>추출한 창문</button>
      <button type="button" aria-pressed={showStickers} onClick={() => setShowStickers(true)}>스티커 적용</button>
    </div>
    <div className="window-flat-stage" aria-busy={!!valid && !result}>
      {!valid || result?.error ? <div className="window-preview-empty"><ScanSearch /><b>{result?.error || "창문의 네 모서리를 확인해주세요."}</b><p>‘창문 영역 직접 선택’에서 유리창 한 면을 지정할 수 있습니다.</p></div>
        : !result?.url ? <div className="window-preview-empty" role="status"><Loader2 className="spin" /><p>창문을 평면으로 펼치고 있어요.</p></div>
        : <svg className="window-flat-pane" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={showStickers ? alt : "원본 사진에서 추출해 평면으로 펼친 창문"} style={{ aspectRatio: `${width} / ${height}`, width: `min(100%, calc(var(--window-height) * ${width / height}))` }}>
          {/* Build-validated local SVGs only; the mask preserves the extracted outline. */}
          <defs dangerouslySetInnerHTML={{ __html: stickerPatternMarkup(recommendation, patternId) }} />
          <defs><mask id={outlineId} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height} style={{ maskType: "alpha" }}><image href={result.url} width={width} height={height} /></mask></defs>
          <image className="extracted-window-image" href={result.url} width={width} height={height} />
          {showStickers && <rect className="window-sticker-overlay" width={width} height={height} fill={`url(#${patternId})`} mask={`url(#${outlineId})`} />}
        </svg>}
    </div>
    <p className="window-preview-footnote">창문 비율은 사진에서 추정한 값입니다. 실제 가로·세로 비율과 시공 간격은 실측 후 확인해주세요.</p>
  </section>;
}

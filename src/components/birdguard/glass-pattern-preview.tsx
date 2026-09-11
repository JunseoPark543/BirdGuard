"use client";

import { useId, useState } from "react";
import { stickerPatternMarkup } from "@/lib/render-sticker-svg";
import type { StickerRecommendation } from "@/lib/recommend-stickers";

type Props = { recommendation: StickerRecommendation };

export function GlassPatternPreview({ recommendation }: Props) {
  const [showStickers, setShowStickers] = useState(true);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const patternId = `basic-window-pattern-${id}`;
  const glassId = `basic-window-glass-${id}`;
  const clipId = `basic-window-clip-${id}`;

  return <section className="basic-window-preview" aria-label="기본 창문 디자인 미리보기">
    <div className="window-preview-heading"><div><small>DESIGN PREVIEW</small><h3>창문에 적용해 보기</h3></div><span>기본 창문</span></div>
    <p className="recommendation-note">기본 창문에서 선택한 스티커의 모양과 색상을 확인해보세요.</p>
    <div className="window-view-switch" role="group" aria-label="스티커 적용 비교">
      <button type="button" aria-pressed={!showStickers} onClick={() => setShowStickers(false)}>적용 전</button>
      <button type="button" aria-pressed={showStickers} onClick={() => setShowStickers(true)}>스티커 적용</button>
    </div>
    <div className="basic-window-stage">
      <svg className="basic-window-model" viewBox="0 0 840 750" role="img" aria-label={showStickers ? `${recommendation.title}을 기본 창문에 적용한 미리보기` : "스티커를 붙이기 전 기본 창문"}>
        {/* Only the local, build-validated sticker artwork is inserted here. */}
        <defs dangerouslySetInnerHTML={{ __html: stickerPatternMarkup(recommendation, patternId) }} />
        <defs>
          <linearGradient id={glassId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#abc7ce" /><stop offset=".55" stopColor="#d7e6e7" /><stop offset="1" stopColor="#91b5bf" />
          </linearGradient>
          <clipPath id={clipId}><rect x="54" y="54" width="352" height="616" /><rect x="434" y="54" width="352" height="616" /></clipPath>
        </defs>
        <rect x="22" y="22" width="796" height="680" rx="6" fill="#e7e6e0" stroke="#b8c0bb" strokeWidth="4" />
        <path d="M28 695V28H812" fill="none" stroke="#fffefa" strokeWidth="8" />
        <g clipPath={`url(#${clipId})`}>
          <rect x="54" y="54" width="732" height="616" fill={`url(#${glassId})`} />
          <path d="M150 54H240L54 490V300ZM575 54H720L452 670H434V400Z" fill="white" opacity=".22" />
          {showStickers && <rect className="window-sticker-overlay" x="54" y="54" width="732" height="616" fill={`url(#${patternId})`} />}
        </g>
        <g fill="none" stroke="#a8b5b1" strokeWidth="4">
          <rect x="52" y="52" width="356" height="620" /><rect x="432" y="52" width="356" height="620" />
        </g>
        <path d="M411 48V676M791 48V676" stroke="#fafbf6" strokeWidth="5" />
        <rect x="414" y="298" width="12" height="84" rx="5" fill="#8d9d95" />
        <rect x="416" y="302" width="5" height="74" rx="2" fill="#dfe6e0" />
        <path d="M22 704H818L832 720H8Z" fill="#f2f1e9" stroke="#b8c0bb" strokeWidth="2" />
        <rect x="8" y="720" width="824" height="12" rx="3" fill="#c9cec7" />
      </svg>
    </div>
    <p className="window-preview-footnote">실제 크기와 간격을 반영하지 않은 디자인 미리보기입니다.</p>
  </section>;
}

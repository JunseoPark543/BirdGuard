"use client";

import { useState, type MouseEvent, type KeyboardEvent } from "react";
import { windowQuad, type Point } from "@/lib/rectify-window";

type Props = { imageUrl: string; onApply: (points: Point[]) => void; onCancel: () => void };
export function WindowCornerPicker({ imageUrl, onApply, onCancel }: Props) {
  const [points, setPoints] = useState<Point[]>([]);
  const [cursor, setCursor] = useState<Point>([500, 500]);
  const [error, setError] = useState("");
  function choose(event: MouseEvent<HTMLButtonElement>) {
    if (points.length >= 4) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const point: Point = event.detail === 0 ? cursor : [
      Math.max(0, Math.min(1000, (event.clientX - bounds.left) / bounds.width * 1000)),
      Math.max(0, Math.min(1000, (event.clientY - bounds.top) / bounds.height * 1000)),
    ];
    setPoints([...points, point]);
    setCursor(point);
    setError("");
  }
  function move(event: KeyboardEvent<HTMLButtonElement>) {
    const steps: Record<string, Point> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    const amount = event.shiftKey ? 1 : 10;
    setCursor(([x, y]) => [Math.max(0, Math.min(1000, x + step[0] * amount)), Math.max(0, Math.min(1000, y + step[1] * amount))]);
  }
  function apply() {
    const quad = windowQuad(points);
    if (!quad) { setError("서로 다른 네 모서리로 창문 영역을 지정해주세요."); return; }
    onApply(quad);
  }
  return <section className="window-corner-picker">
    <p id="corner-picker-help">한 창문의 왼쪽 위 → 오른쪽 위 → 오른쪽 아래 → 왼쪽 아래를 눌러주세요. 서로 다른 방향의 유리 면은 따로 선택해주세요.</p>
    <button type="button" className="corner-pick-surface" aria-label="사진에서 창문 모서리 지정. 방향키로 위치를 이동하고 Enter로 선택할 수 있습니다." aria-describedby="corner-picker-help" onClick={choose} onKeyDown={move}>
      <img src={imageUrl} alt="창문 영역을 지정할 원본 사진" draggable={false} />
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        {points.length > 1 && <polygon points={points.map(point => point.join(",")).join(" ")} fill="#00a97830" stroke="#00e3a0" strokeWidth="4" />}
        {points.map(([x, y], index) => <g key={index}><circle cx={x} cy={y} r="18" fill="#087657" stroke="white" strokeWidth="3" /><text x={x} y={y + 7} textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{index + 1}</text></g>)}
        {points.length < 4 && <path d={`M${cursor[0] - 12} ${cursor[1]}h24 M${cursor[0]} ${cursor[1] - 12}v24`} stroke="white" strokeWidth="3" />}
      </svg>
    </button>
    <p aria-live="polite">{error || `모서리 ${points.length}/4개 선택`}</p>
    <div className="window-picker-actions">
      <button type="button" onClick={() => { setPoints([]); setError(""); }}>다시 지정</button>
      <button type="button" onClick={onCancel}>취소</button>
      <button type="button" disabled={points.length !== 4} onClick={apply}>이 창문 사용</button>
    </div>
  </section>;
}

"use client";

import { ArrowRight, Check, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";
import { AnalysisSummary } from "@/components/birdguard/analysis-summary";
import { CategorySelect } from "@/components/birdguard/category-select";
import { GlassPatternPreview } from "@/components/birdguard/glass-pattern-preview";
import { buildingGeometries, designPreviewNotice, facadeMaterials, facadeTones, spaceUses, stickerColors, stickerDataUrl, visualComplexities, type StickerPreferences } from "@/config/sticker-catalog";
import type { StickerRecommendation } from "@/lib/recommend-stickers";
import type { BuildingAnalysis, BuildingCategoryId } from "@/types/birdguard";

type Props = {
  previewUrl: string; analysis: BuildingAnalysis; selectedCategory: BuildingCategoryId;
  preferences: StickerPreferences; recommendations: StickerRecommendation[]; selected: StickerRecommendation;
  isGenerating: boolean; onSelectedCategoryChange: (id: BuildingCategoryId) => void;
  onPreferencesChange: (value: StickerPreferences) => void; onStickerChange: (id: string) => void; onGenerate: () => void;
};
type Tab = "design" | "material" | "estimate";

export function AnalysisStep({ previewUrl, analysis, selectedCategory, preferences, recommendations, selected, isGenerating, onSelectedCategoryChange, onPreferencesChange, onStickerChange, onGenerate }: Props) {
  const [tab, setTab] = useState<Tab>("design");
  const fields: Array<{ key: keyof StickerPreferences; label: string; options: Record<string, string> }> = [
    { key: "spaceUse", label: "스티커를 설치할 공간의 용도", options: spaceUses },
    { key: "material", label: "주변 외벽 재질", options: facadeMaterials },
    { key: "geometry", label: "건물·창틀 형태", options: buildingGeometries },
    { key: "tone", label: "외벽 색상 계열", options: facadeTones },
    { key: "complexity", label: "외벽의 시각적 복잡도", options: visualComplexities },
    { key: "preferredColor", label: "선호 색상", options: { auto: "환경에 맞춰 추천", ...stickerColors } },
  ];
  return <section className="analysis-page">
    <div className="page-title"><div><span>AI PHOTO ANALYSIS</span><h1>분석 결과</h1></div><button type="button" onClick={() => location.reload()}><RotateCcw /> 다시 분석</button></div>
    <div className="analysis-photo"><img src={previewUrl} alt="분석한 건물" /><span className="photo-count">1 / 1</span></div>
    <AnalysisSummary analysis={analysis} />
    <section className="recommend-box">
      <div className="recommend-heading"><span><Sparkles /></span><div><small>DESIGN PREFERENCES</small><h2>추천 조건 확인</h2></div></div>
      <CategorySelect value={selectedCategory} onChange={onSelectedCategoryChange} disabled={isGenerating} />
      <p className="recommendation-note">공간 용도를 직접 선택하면 건물 분류보다 우선합니다. 사진에서 확인하기 어려운 재질·형태·색상은 아래에서 보완해주세요.</p>
      <div className="sticker-preferences">{fields.map(field => <label key={field.key}>{field.label}<select disabled={isGenerating} value={preferences[field.key]} onChange={event => onPreferencesChange({ ...preferences, [field.key]: event.target.value })}>{Object.entries(field.options).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>)}</div>
    </section>
    <section className="design-recommendation">
      <div className="recommend-title"><div><span>2-2</span><div><small>PERSONALIZED SOLUTION</small><h2>맞춤 디자인 추천</h2></div></div><p>건물 환경과 공간 용도에 맞춘 세 가지 디자인입니다.</p></div>
      <div className="recommend-tabs" role="tablist" aria-label="디자인 상세">
        {([ ["design", "추천 디자인"], ["material", "마감 제안"], ["estimate", "견적 안내"] ] as const).map(([id, label]) => <button type="button" role="tab" aria-selected={tab === id} key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>)}
      </div>
      {tab === "design" && <div className="tab-panel" role="tabpanel">
        <div className="sticker-options">{recommendations.map(item => <button type="button" key={item.id} disabled={isGenerating} aria-pressed={selected.id === item.id} className={selected.id === item.id ? "selected" : ""} onClick={() => onStickerChange(item.id)}>
          <span className="sticker-option-label">{item.label}</span>
          <span className="sticker-artwork"><img src={stickerDataUrl(item.asset)} alt="" /><img src={stickerDataUrl(item.companion)} alt="" /></span>
          <b>{item.title}</b><small>{item.layoutLabel}</small>{selected.id === item.id && <Check className="option-check" />}
        </button>)}</div>
        <div className="before-after"><figure><img src={previewUrl} alt="적용 전 건물" /><figcaption>Before<br/><small>현재 유리창</small></figcaption></figure><figure className="after-preview"><GlassPatternPreview imageUrl={previewUrl} regions={analysis.glassRegions} recommendation={selected} alt={`${selected.title}을 유리 영역에 반복한 미리보기`} /><figcaption>After<br/><small>{selected.label} 적용 미리보기</small></figcaption></figure><span>→</span></div>
        <p className="recommendation-note">{designPreviewNotice}</p>
        <div className="sticker-reasons" aria-live="polite"><h3>{selected.label} 추천 이유</h3><ul>{selected.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul></div>
        <button type="button" className="primary-button next-tab" onClick={() => setTab("material")}>마감 제안 보기 <ArrowRight /></button>
      </div>}
      {tab === "material" && <div className="tab-panel" role="tabpanel"><div className="material-card"><span>제안</span><div><small>유리 부착용 마감 방향</small><h3>{selected.finish}</h3><p>주변 외벽과의 시각적 조화를 위한 제안입니다. 실제 필름의 색상·내구성·부착 적합성은 제품과 현장 확인 후 결정됩니다.</p></div></div><button type="button" className="primary-button next-tab" onClick={() => setTab("estimate")}>견적 안내 보기 <ArrowRight /></button></div>}
      {tab === "estimate" && <div className="tab-panel" role="tabpanel"><div className="estimate-card"><div><span>선택 디자인</span><b>{selected.label} · {selected.title}</b></div><div><span>마감 제안</span><b>{selected.finish}</b></div><div><span>배치 상태</span><b>실측 전 디자인 미리보기</b></div><p>정확한 간격·수량·비용은 유리 가로·세로와 창 개수를 실측한 뒤 산정할 수 있습니다. 현재는 디자인 미리보기만 제공합니다.</p></div></div>}
    </section>
    <button type="button" className="primary-button sticky-action" disabled={isGenerating} onClick={onGenerate}>이 디자인 선택하기 <ArrowRight /></button>
  </section>;
}

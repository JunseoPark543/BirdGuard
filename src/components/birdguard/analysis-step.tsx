"use client";

import { ArrowRight, Check, CircleDot, Grid3X3, Minus, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";
import { AnalysisSummary } from "@/components/birdguard/analysis-summary";
import { CategorySelect } from "@/components/birdguard/category-select";
import { GlassPatternPreview } from "@/components/birdguard/glass-pattern-preview";
import { appConfig } from "@/config/app";
import type { BuildingAnalysis, BuildingCategoryId } from "@/types/birdguard";

type Props = { previewUrl: string; analysis: BuildingAnalysis; selectedCategory: BuildingCategoryId; customDesignRequest: string; isGenerating: boolean; onSelectedCategoryChange: (id: BuildingCategoryId) => void; onCustomDesignRequestChange: (v: string) => void; onGenerate: () => void };
type Tab = "design" | "material" | "estimate";
const patterns = [
  { id: "dot", label: "도트형", note: "부드러운 점 패턴", icon: CircleDot },
  { id: "line", label: "라인형", note: "깔끔한 세로 패턴", icon: Minus },
  { id: "grid", label: "격자형", note: "안정적인 격자 패턴", icon: Grid3X3 },
  { id: "mixed", label: "혼합형", note: "점과 선의 조합", icon: Sparkles },
] as const;

export function AnalysisStep({ previewUrl, analysis, selectedCategory, customDesignRequest, isGenerating, onSelectedCategoryChange, onCustomDesignRequestChange, onGenerate }: Props) {
  const [tab, setTab] = useState<Tab>("design");
  const [pattern, setPattern] = useState<(typeof patterns)[number]["id"]>("dot");
  function choosePattern(id: (typeof patterns)[number]["id"], label: string) {
    setPattern(id);
    const cleaned = customDesignRequest.replace(/^추천 패턴:\s*[^.]+\.\s*/, "");
    onCustomDesignRequestChange(`추천 패턴: ${label}. ${cleaned}`.trim());
  }
  return <section className="analysis-page">
    <div className="page-title"><div><span>AI PHOTO ANALYSIS</span><h1>분석 결과</h1></div><button type="button" onClick={() => location.reload()}><RotateCcw /> 다시 분석</button></div>
    <div className="analysis-photo"><img src={previewUrl} alt="분석한 건물" /><span className="scan-corner one"/><span className="scan-corner two"/><span className="photo-count">1 / 1</span></div>
    <AnalysisSummary analysis={analysis} />

    <section className="design-recommendation">
      <div className="recommend-title"><div><span>2-2</span><div><small>PERSONALIZED SOLUTION</small><h2>맞춤 디자인 추천</h2></div></div><p>분석한 건물 환경에 맞는 충돌 방지 솔루션입니다.</p></div>
      <div className="recommend-tabs" role="tablist">
        <button className={tab === "design" ? "active" : ""} onClick={() => setTab("design")}>추천 디자인</button>
        <button className={tab === "material" ? "active" : ""} onClick={() => setTab("material")}>소재 추천</button>
        <button className={tab === "estimate" ? "active" : ""} onClick={() => setTab("estimate")}>견적 요약</button>
      </div>

      {tab === "design" && <div className="tab-panel">
        <div className="before-after"><figure><img src={previewUrl} alt="적용 전 건물"/><figcaption>Before<br/><small>현재 유리창</small></figcaption></figure><figure className="after-preview"><GlassPatternPreview imageUrl={previewUrl} regions={analysis.glassRegions} pattern={pattern} alt={`${patterns.find(v => v.id === pattern)?.label}을 유리 영역에 적용한 예상 모습`} /><figcaption>After<br/><small>인식된 유리 영역만 적용</small></figcaption></figure><span>→</span></div>
        <div className="standard-badge"><Check /> 추천 디자인 <b>5×10cm 규격 준수</b></div>
        <div className="pattern-options">{patterns.map(item => { const Icon = item.icon; return <button key={item.id} className={pattern === item.id ? "selected" : ""} onClick={() => choosePattern(item.id, item.label)}><span className={`pattern-swatch swatch-${item.id}`}><Icon /></span><b>{item.label}</b><small>{item.note}</small>{pattern === item.id && <Check className="option-check"/>}</button>})}</div>
        <button className="primary-button next-tab" onClick={() => setTab("material")}>소재 추천 보기 <ArrowRight /></button>
      </div>}

      {tab === "material" && <div className="tab-panel"><div className="material-card selected"><span>추천</span><div><small>유리 외부 부착용</small><h3>고투명 UV 필름</h3><p>채광과 외관을 유지하면서 자외선 반사 패턴으로 새가 장애물을 인식하도록 돕습니다.</p></div><Check /></div><div className="material-facts"><div><b>내후성</b><span>약 5년</span></div><div><b>시야 확보</b><span>우수</span></div><div><b>시공 방식</b><span>외부 부착</span></div></div><button className="primary-button next-tab" onClick={() => setTab("estimate")}>견적 요약 보기 <ArrowRight /></button></div>}

      {tab === "estimate" && <div className="tab-panel"><div className="estimate-card"><div><span>선택 디자인</span><b>{patterns.find(v => v.id === pattern)?.label}</b></div><div><span>추천 소재</span><b>고투명 UV 필름</b></div><div><span>규격 기준</span><b>가로 10cm × 세로 5cm 이하</b></div><p>정확한 수량과 비용은 창호 실측 후 산정됩니다.</p></div></div>}
    </section>

    <section className="recommend-box"><div className="recommend-heading"><span><Sparkles /></span><div><small>AI SOLUTION</small><h2>최종 디자인 조건</h2></div></div><CategorySelect value={selectedCategory} onChange={onSelectedCategoryChange} disabled={isGenerating} /><label>추가 디자인 요청<textarea maxLength={appConfig.maxCustomRequestLength} value={customDesignRequest} disabled={isGenerating} onChange={e => onCustomDesignRequestChange(e.target.value)} placeholder="예: 차분한 녹색 계열, 잎 모양을 활용해 주세요."/><small>{customDesignRequest.length}/{appConfig.maxCustomRequestLength}자</small></label></section>
    <button type="button" className="primary-button sticky-action" disabled={isGenerating} onClick={onGenerate}>이 디자인으로 생성하기 <ArrowRight /></button>
  </section>;
}

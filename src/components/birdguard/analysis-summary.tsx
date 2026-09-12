import { AlertTriangle, Building2, Leaf, Maximize2, ShieldAlert, Sparkles, Sun } from "lucide-react";
import { getCategoryConfig } from "@/config/categories";
import { toPercent } from "@/lib/utils";
import type { BuildingAnalysis } from "@/types/birdguard";
const size = { small: "작음", medium: "중간", large: "큼", mixed: "혼합", unknown: "확인 어려움" };
const level = { low: "낮음", medium: "중간", high: "높음", unknown: "확인 어려움" };
const plants = { none: "거의 없음", some: "일부 있음", dense: "많음", unknown: "확인 어려움" };
const risks = { low: "낮음", medium: "보통", high: "높음", critical: "매우 높음", unknown: "확인 어려움" };
export function AnalysisSummary({ analysis }: { analysis: BuildingAnalysis }) {
  const candidates = [{ category: analysis.primaryCategory, confidence: analysis.classificationConfidence }, ...analysis.secondaryCategories].slice(0, 3);
  return <div className="analysis-summary">
    <section><h2><span>1</span> 공간 인지</h2><div className="classification-card"><div className="classification-label"><Building2 /><div><small>대표 분류 · {analysis.buildingUse}</small><b>{getCategoryConfig(analysis.primaryCategory).labelKo}</b></div><strong>{toPercent(analysis.classificationConfidence)}</strong></div><div className="confidence-list">{candidates.map((item, i) => <div key={item.category}><span>{i + 1}</span><b>{getCategoryConfig(item.category).labelKo}</b><i style={{width: `${Math.min(item.confidence, 100)}%`}}/><em>{toPercent(item.confidence)}</em></div>)}</div><p>{analysis.classificationReason}</p></div></section>
    <section><h2><span>2</span> 착시 환경 분석</h2><div className="metric-grid"><div><Maximize2 /><small>창문/패널 크기</small><b>{size[analysis.windowSize]}</b></div><div><Sun /><small>유리 반사도</small><b>{level[analysis.glassReflectivity]}</b></div><div><Leaf /><small>주변 식생</small><b>{plants[analysis.nearbyVegetation]}</b></div></div></section>
    <section><h2><span>3</span> 위험도 진단</h2><div className={`risk-card risk-${analysis.birdCollisionRisk}`}><ShieldAlert /><div><small>건물 분류 기준 종합</small><h3>충돌 위험도: {risks[analysis.birdCollisionRisk]}</h3><p>{analysis.riskFactors.join(" · ")}</p></div></div><div className="caution-card"><AlertTriangle /><div><b>설계 적용 시 확인하세요</b><p>{analysis.caution}</p><p><strong>패턴 간격은 가로 10cm, 세로 5cm 이하</strong>로 유지해야 합니다.</p></div></div></section>
    <details><summary><Sparkles /> 전문 분석 데이터 보기</summary><ul>{analysis.analyzedEvidence.map(v => <li key={v}>{v}</li>)}</ul></details>
  </div>;
}

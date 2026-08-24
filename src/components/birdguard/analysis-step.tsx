import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { appConfig } from "@/config/app";
import { AnalysisSummary } from "@/components/birdguard/analysis-summary";
import { CategorySelect } from "@/components/birdguard/category-select";
import type { BuildingAnalysis, BuildingCategoryId } from "@/types/birdguard";
type Props = { previewUrl: string; analysis: BuildingAnalysis; selectedCategory: BuildingCategoryId; customDesignRequest: string; isGenerating: boolean; onSelectedCategoryChange: (id: BuildingCategoryId) => void; onCustomDesignRequestChange: (v: string) => void; onGenerate: () => void };
export function AnalysisStep({ previewUrl, analysis, selectedCategory, customDesignRequest, isGenerating, onSelectedCategoryChange, onCustomDesignRequestChange, onGenerate }: Props) {
  return <section className="analysis-page">
    <div className="page-title"><div><span>AI PHOTO ANALYSIS</span><h1>분석 결과</h1></div><button type="button" onClick={() => location.reload()}><RotateCcw /> 다시 분석</button></div>
    <div className="analysis-photo"><img src={previewUrl} alt="분석한 건물" /><span className="scan-corner one"/><span className="scan-corner two"/><span className="photo-count">1 / 1</span></div>
    <AnalysisSummary analysis={analysis} />
    <section className="recommend-box"><div className="recommend-heading"><span><Sparkles /></span><div><small>AI SOLUTION</small><h2>맞춤 디자인 조건</h2></div></div><CategorySelect value={selectedCategory} onChange={onSelectedCategoryChange} disabled={isGenerating} /><label>추가 디자인 요청<textarea maxLength={appConfig.maxCustomRequestLength} value={customDesignRequest} disabled={isGenerating} onChange={e => onCustomDesignRequestChange(e.target.value)} placeholder="예: 차분한 녹색 계열, 잎 모양을 활용해 주세요."/><small>{customDesignRequest.length}/{appConfig.maxCustomRequestLength}자</small></label></section>
    <button type="button" className="primary-button sticky-action" disabled={isGenerating} onClick={onGenerate}>맞춤 디자인 추천 보기 <ArrowRight /></button>
  </section>;
}

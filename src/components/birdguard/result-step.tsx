import { Download, MapPinned, RotateCcw, ShieldCheck } from "lucide-react";
import { AnalysisSummary } from "@/components/birdguard/analysis-summary";
import { getCategoryConfig } from "@/config/categories";
import type { DesignExplanation } from "@/lib/build-design-explanation";
import type { BuildingAnalysis, BuildingCategoryId } from "@/types/birdguard";
type Props = { resultImageUrl: string; analysis: BuildingAnalysis; initialCategory: BuildingCategoryId; selectedCategory: BuildingCategoryId; designExplanation: DesignExplanation; onDownload: () => void; onRestart: () => void; onRegister: () => void };
export function ResultStep({ resultImageUrl, analysis, initialCategory, selectedCategory, designExplanation, onDownload, onRestart, onRegister }: Props) {
  return <section className="analysis-page">
    <div className="page-title"><div><span>DESIGN COMPLETE</span><h1>맞춤 디자인 추천</h1></div><ShieldCheck color="var(--green)" /></div>
    <div className="analysis-photo"><img src={resultImageUrl} alt="생성된 조류 충돌 방지 디자인" /></div>
    <section className="recommend-box"><div className="recommend-heading"><span><ShieldCheck /></span><div><small>RECOMMENDED SOLUTION</small><h2>{getCategoryConfig(selectedCategory).labelKo} 맞춤 디자인</h2></div></div><p>{designExplanation.summary}</p><p>{designExplanation.reason}</p><ul>{designExplanation.reflectedFactors.map(v => <li key={v}>{v}</li>)}</ul><small>AI 최초 분류: {getCategoryConfig(initialCategory).labelKo} · 패턴 간격은 실제 시공 시 가로 10cm, 세로 5cm 이하를 지켜주세요.</small></section>
    <button type="button" className="primary-button" onClick={onRegister}><MapPinned /> 내 버디존 등록하기</button>
    <div className="grid gap-3 sm:grid-cols-2"><button type="button" className="secondary-button !mt-0 h-14" onClick={onDownload}><Download className="inline w-5" /> 이미지 다운로드</button><button type="button" className="secondary-button !mt-0 h-14" onClick={onRestart}><RotateCcw className="inline w-5" /> 새 사진 분석하기</button></div>
    <AnalysisSummary analysis={analysis} />
  </section>;
}

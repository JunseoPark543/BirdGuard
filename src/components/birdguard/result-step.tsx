import { Download, RotateCcw } from "lucide-react";

import { AnalysisSummary } from "@/components/birdguard/analysis-summary";
import { getCategoryConfig } from "@/config/categories";
import type { DesignExplanation } from "@/lib/build-design-explanation";
import type { BuildingAnalysis, BuildingCategoryId } from "@/types/birdguard";

type ResultStepProps = {
  resultImageUrl: string;
  analysis: BuildingAnalysis;
  initialCategory: BuildingCategoryId;
  selectedCategory: BuildingCategoryId;
  designExplanation: DesignExplanation;
  onDownload: () => void;
  onRestart: () => void;
};

export function ResultStep({
  resultImageUrl,
  analysis,
  initialCategory,
  selectedCategory,
  designExplanation,
  onDownload,
  onRestart,
}: ResultStepProps) {
  const initial = getCategoryConfig(initialCategory);
  const selected = getCategoryConfig(selectedCategory);

  return (
    <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-2">
        <h2 className="text-xl font-bold text-slate-950">5단계: 결과</h2>
        <p className="text-sm leading-6 text-slate-600">
          생성된 결과는 조류 충돌 방지 스티커의 컨셉 시안입니다. 실제 제작과
          시공 전에는 현장 환경과 관련 지침을 별도로 검토해주세요.
        </p>
      </div>

      <img
        src={resultImageUrl}
        alt="생성된 조류 충돌 방지 스티커 컨셉 이미지"
        className="mx-auto aspect-square w-full max-w-xl rounded-lg border border-slate-200 bg-slate-50 object-contain"
      />

      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <dt className="text-xs font-medium text-slate-500">AI 최초 카테고리</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">{initial.labelKo}</dd>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <dt className="text-xs font-medium text-slate-500">최종 선택 카테고리</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">{selected.labelKo}</dd>
        </div>
      </dl>

      <div className="grid gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <h3 className="text-base font-semibold text-emerald-950">디자인 생성 이유</h3>
        <p className="text-sm leading-6 text-emerald-950">{designExplanation.summary}</p>
        <p className="text-sm leading-6 text-emerald-950">{designExplanation.categoryLine}</p>
        <p className="text-sm leading-6 text-emerald-950">{designExplanation.reason}</p>
        <ul className="grid gap-2 text-sm text-emerald-950">
          {designExplanation.reflectedFactors.map((factor) => (
            <li key={factor} className="rounded-lg bg-white/70 px-3 py-2">
              {factor}
            </li>
          ))}
        </ul>
        <p className="text-xs leading-5 text-emerald-900">
          {designExplanation.conceptNote}
        </p>
      </div>

      <AnalysisSummary analysis={analysis} />

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
          onClick={onDownload}
        >
          <Download className="h-5 w-5" aria-hidden="true" />
          결과 이미지 다운로드
        </button>
        <button
          type="button"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-base font-semibold text-slate-950 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
          onClick={onRestart}
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
          처음부터 다시 시작
        </button>
      </div>
    </section>
  );
}

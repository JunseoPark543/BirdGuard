import { Sparkles } from "lucide-react";

import { appConfig } from "@/config/app";
import { AnalysisSummary } from "@/components/birdguard/analysis-summary";
import { CategorySelect } from "@/components/birdguard/category-select";
import type { BuildingAnalysis, BuildingCategoryId } from "@/types/birdguard";

type AnalysisStepProps = {
  previewUrl: string;
  analysis: BuildingAnalysis;
  selectedCategory: BuildingCategoryId;
  customDesignRequest: string;
  isGenerating: boolean;
  onSelectedCategoryChange: (categoryId: BuildingCategoryId) => void;
  onCustomDesignRequestChange: (value: string) => void;
  onGenerate: () => void;
};

export function AnalysisStep({
  previewUrl,
  analysis,
  selectedCategory,
  customDesignRequest,
  isGenerating,
  onSelectedCategoryChange,
  onCustomDesignRequestChange,
  onGenerate,
}: AnalysisStepProps) {
  return (
    <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-2">
        <h2 className="text-xl font-bold text-slate-950">3단계: 분석 결과 확인</h2>
        <p className="text-sm leading-6 text-slate-600">
          아래 결과는 사진 한 장을 바탕으로 한 AI 추정입니다. 필요하면 카테고리를
          수정한 뒤 스티커 디자인을 만들 수 있습니다.
        </p>
      </div>

      <img
        src={previewUrl}
        alt="분석이 완료된 업로드 사진"
        className="max-h-[420px] w-full rounded-lg border border-slate-200 object-contain"
      />

      <AnalysisSummary analysis={analysis} />

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <CategorySelect
          value={selectedCategory}
          onChange={onSelectedCategoryChange}
          disabled={isGenerating}
        />
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          추가 디자인 조건
          <textarea
            className="min-h-28 rounded-lg border border-slate-300 bg-white p-3 text-base text-slate-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
            maxLength={appConfig.maxCustomRequestLength}
            placeholder="예: 초록색 계열, 나뭇잎 모양, 글자 없이 만들어주세요."
            value={customDesignRequest}
            disabled={isGenerating}
            onChange={(event) => onCustomDesignRequestChange(event.target.value)}
          />
          <span className="text-right text-xs text-slate-500">
            {customDesignRequest.length}/{appConfig.maxCustomRequestLength}자
          </span>
        </label>
      </div>

      <button
        type="button"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 text-base font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={isGenerating}
        onClick={onGenerate}
      >
        <Sparkles className="h-5 w-5" aria-hidden="true" />
        스티커 디자인 만들기
      </button>
    </section>
  );
}

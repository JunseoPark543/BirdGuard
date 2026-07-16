import { Loader2 } from "lucide-react";

import { getCategoryConfig } from "@/config/categories";
import { truncateText } from "@/lib/utils";
import type { BuildingCategoryId } from "@/types/birdguard";

type GeneratingStepProps = {
  selectedCategory: BuildingCategoryId;
  customDesignRequest: string;
};

export function GeneratingStep({
  selectedCategory,
  customDesignRequest,
}: GeneratingStepProps) {
  const category = getCategoryConfig(selectedCategory);

  return (
    <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-700" aria-hidden="true" />
        <h2 className="text-xl font-bold text-slate-950">
          건물 환경에 맞는 스티커 디자인을 만들고 있습니다.
        </h2>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <dt className="text-xs font-medium text-slate-500">선택 카테고리</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">{category.labelKo}</dd>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <dt className="text-xs font-medium text-slate-500">추가 조건</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">
            {customDesignRequest
              ? truncateText(customDesignRequest, 80)
              : "입력된 추가 조건 없음"}
          </dd>
        </div>
      </dl>
      <p className="text-sm leading-6 text-slate-600">
        이미지 생성 중에는 중복 클릭을 막습니다. 생성 성공 후에는 다시 생성 버튼을
        제공하지 않습니다.
      </p>
    </section>
  );
}

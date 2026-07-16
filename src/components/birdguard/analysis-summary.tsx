import { getCategoryConfig } from "@/config/categories";
import { toPercent } from "@/lib/utils";
import type { BuildingAnalysis } from "@/types/birdguard";

const windowSizeLabels = {
  small: "작음",
  medium: "중간",
  large: "큼",
  mixed: "혼합",
  unknown: "확인 어려움",
};

const visualLevelLabels = {
  low: "낮음",
  medium: "중간",
  high: "높음",
  unknown: "확인 어려움",
};

const vegetationLabels = {
  none: "거의 없음",
  some: "일부 있음",
  dense: "많음",
  unknown: "확인 어려움",
};

const riskLabels = {
  low: "낮음",
  medium: "중간",
  high: "높음",
  critical: "매우 높음",
  unknown: "확인 어려움",
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

function BulletList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="grid gap-2">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <ul className="grid gap-2 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AnalysisSummary({ analysis }: { analysis: BuildingAnalysis }) {
  const primaryCategory = getCategoryConfig(analysis.primaryCategory);
  const secondaryText =
    analysis.secondaryCategories
      .map(
        (item) =>
          `${getCategoryConfig(item.category).labelKo} ${toPercent(item.confidence)}`,
      )
      .join(", ") || "보조 후보 없음";
  const floorText =
    analysis.estimatedFloorCount.min === null &&
    analysis.estimatedFloorCount.max === null
      ? "확인 어려움"
      : `${analysis.estimatedFloorCount.min ?? "?"}-${analysis.estimatedFloorCount.max ?? "?"}층 추정`;

  return (
    <div className="grid gap-5">
      <dl className="grid gap-3 sm:grid-cols-2">
        <Field label="AI 대표 분류" value={primaryCategory.labelKo} />
        <Field label="분류 신뢰도" value={toPercent(analysis.classificationConfidence)} />
        <Field label="보조 후보" value={secondaryText} />
        <Field label="건물 용도" value={analysis.buildingUse} />
        <Field label="창문 크기" value={windowSizeLabels[analysis.windowSize]} />
        <Field label="유리 반사도" value={visualLevelLabels[analysis.glassReflectivity]} />
        <Field label="주변 나무와 식생" value={vegetationLabels[analysis.nearbyVegetation]} />
        <Field label="하늘 반사" value={visualLevelLabels[analysis.skyReflection]} />
        <Field label="예상 층수" value={floorText} />
        <Field label="조류 충돌 위험도" value={riskLabels[analysis.birdCollisionRisk]} />
      </dl>

      <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700">
        {analysis.estimatedFloorCount.explanation}
      </p>

      <BulletList title="주요 위험 요인" items={analysis.riskFactors} />
      <BulletList title="분석 근거" items={analysis.analyzedEvidence} />
      <BulletList title="디자인 반영 요소" items={analysis.designConsiderations} />

      <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
        {analysis.caution}
      </p>
    </div>
  );
}

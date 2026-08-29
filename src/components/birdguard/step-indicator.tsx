import type { BirdGuardStep } from "@/types/birdguard";

const steps: Array<{ id: BirdGuardStep; label: string }> = [
  { id: "upload", label: "업로드" },
  { id: "analyzing", label: "분석 중" },
  { id: "analysis", label: "결과 확인" },
  { id: "generating", label: "생성 중" },
  { id: "result", label: "완료" },
  { id: "registration", label: "버디존 등록" },
  { id: "buddyzone-map", label: "버디존 지도" },
];

export function StepIndicator({ currentStep }: { currentStep: BirdGuardStep }) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <ol className="grid grid-cols-7 gap-1" aria-label="현재 단계">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isComplete = index < currentIndex;

        return (
          <li
            key={step.id}
            className={[
              "rounded-lg border px-2 py-2 text-center text-xs font-medium sm:text-sm",
              isActive
                ? "border-emerald-700 bg-emerald-700 text-white"
                : isComplete
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-slate-200 bg-white text-slate-500",
            ].join(" ")}
            aria-current={isActive ? "step" : undefined}
          >
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}

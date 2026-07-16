import { Loader2 } from "lucide-react";

export function AnalyzingStep({ previewUrl }: { previewUrl: string }) {
  return (
    <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-700" aria-hidden="true" />
        <h2 className="text-xl font-bold text-slate-950">
          건물과 창문 환경을 분석하고 있습니다.
        </h2>
      </div>
      <img
        src={previewUrl}
        alt="분석 중인 업로드 사진"
        className="max-h-[520px] w-full rounded-lg border border-slate-200 object-contain"
      />
      <p className="text-sm leading-6 text-slate-600">
        분석 중에는 버튼을 다시 누를 수 없습니다. 사진은 서버에 영구 저장되지 않습니다.
      </p>
    </section>
  );
}

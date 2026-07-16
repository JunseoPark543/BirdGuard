"use client";

import { ImageUp, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { getAcceptedFileInputValue } from "@/lib/file-validation";

type UploadStepProps = {
  previewUrl: string | null;
  fileName: string | null;
  isAnalyzing: boolean;
  onFileSelected: (file: File) => void;
  onAnalyze: () => void;
};

export function UploadStep({
  previewUrl,
  fileName,
  isAnalyzing,
  onFileSelected,
  onAnalyze,
}: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file: File | undefined) {
    if (file) {
      onFileSelected(file);
    }
  }

  return (
    <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-2">
        <h2 className="text-xl font-bold text-slate-950">1단계: 건물 사진 업로드</h2>
        <p className="text-sm leading-6 text-slate-600">
          업로드한 이미지는 분석을 위해 Gemini API로 전송되며, 버드가드 서버에
          영구 저장되지 않습니다.
        </p>
        <p className="text-sm leading-6 text-slate-600">
          사람 얼굴이나 차량 번호판이 크게 포함된 사진은 피해주세요.
        </p>
      </div>

      <div
        className={[
          "grid min-h-56 place-items-center rounded-lg border-2 border-dashed p-4 text-center transition",
          isDragging
            ? "border-emerald-600 bg-emerald-50"
            : "border-slate-300 bg-slate-50",
        ].join(" ")}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFile(event.dataTransfer.files.item(0) ?? undefined);
        }}
      >
        <div className="grid gap-4">
          <ImageUp className="mx-auto h-10 w-10 text-emerald-700" aria-hidden="true" />
          <div className="grid gap-1">
            <p className="font-semibold text-slate-950">사진을 끌어오거나 파일을 선택하세요</p>
            <p className="text-sm text-slate-600">JPG, PNG, WebP / 최대 10MB</p>
          </div>
          <input
            ref={inputRef}
            id="building-image"
            className="sr-only"
            type="file"
            accept={getAcceptedFileInputValue()}
            onChange={(event) => handleFile(event.target.files?.item(0) ?? undefined)}
          />
          <button
            type="button"
            className="mx-auto inline-flex h-11 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            파일 선택
          </button>
        </div>
      </div>

      {previewUrl ? (
        <figure className="grid gap-3">
          <img
            src={previewUrl}
            alt="업로드한 건물 사진 미리보기"
            className="max-h-[420px] w-full rounded-lg border border-slate-200 object-contain"
          />
          <figcaption className="text-sm text-slate-600">{fileName}</figcaption>
        </figure>
      ) : (
        <figure className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <img
            src="/mock/sticker-result.svg"
            alt="버드가드 데모 스티커 예시"
            className="mx-auto aspect-square w-40 rounded-lg border border-slate-200 bg-white object-contain"
          />
          <figcaption className="text-center text-sm text-slate-600">
            데모 모드에서는 업로드 후 샘플 분석과 샘플 스티커가 표시됩니다.
          </figcaption>
        </figure>
      )}

      <button
        type="button"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 text-base font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={!previewUrl || isAnalyzing}
        onClick={onAnalyze}
      >
        {isAnalyzing ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : (
          <ImageUp className="h-5 w-5" aria-hidden="true" />
        )}
        건물 분석하기
      </button>
    </section>
  );
}

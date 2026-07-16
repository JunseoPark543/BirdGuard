"use client";

import { useEffect, useRef, useState } from "react";

import { AnalysisStep } from "@/components/birdguard/analysis-step";
import { AnalyzingStep } from "@/components/birdguard/analyzing-step";
import { DemoModeBadge } from "@/components/birdguard/demo-mode-badge";
import { ErrorMessage } from "@/components/birdguard/error-message";
import { GeneratingStep } from "@/components/birdguard/generating-step";
import { ResultStep } from "@/components/birdguard/result-step";
import { StepIndicator } from "@/components/birdguard/step-indicator";
import { UploadStep } from "@/components/birdguard/upload-step";
import { buildDesignExplanation, type DesignExplanation } from "@/lib/build-design-explanation";
import { downloadBlobUrl } from "@/lib/download-image";
import { AppError } from "@/lib/errors";
import { assertBrowserReadableImage, validateImageFileMetadata } from "@/lib/file-validation";
import { optimizeImageForAnalysis } from "@/lib/optimize-image";
import { buildingAnalysisSchema } from "@/schemas/analysis";
import type { ApiResponse } from "@/schemas/api";
import type {
  BirdGuardStep,
  BuildingAnalysis,
  BuildingCategoryId,
} from "@/types/birdguard";

function getClientErrorMessage(error: unknown) {
  if (error instanceof AppError) {
    return error.safeMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "알 수 없는 오류가 발생했습니다.";
}

async function readJsonError(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.";
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<unknown>
    | null;
  if (payload && !payload.success) {
    return payload.error.message;
  }

  return "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.";
}

export default function Home() {
  const [step, setStep] = useState<BirdGuardStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<BuildingAnalysis | null>(null);
  const [initialCategory, setInitialCategory] = useState<BuildingCategoryId | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] =
    useState<BuildingCategoryId>("other");
  const [customDesignRequest, setCustomDesignRequest] = useState("");
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [designExplanation, setDesignExplanation] =
    useState<DesignExplanation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewUrlRef = useRef<string | null>(null);
  const resultImageUrlRef = useRef<string | null>(null);
  const analyzeInFlightRef = useRef(false);
  const generateInFlightRef = useRef(false);
  const generationLockedRef = useRef(false);

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

  function revokePreviewUrl() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }

  function revokeResultUrl() {
    if (resultImageUrlRef.current) {
      URL.revokeObjectURL(resultImageUrlRef.current);
      resultImageUrlRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      revokePreviewUrl();
      revokeResultUrl();
    };
  }, []);

  async function handleFileSelected(file: File) {
    try {
      setErrorMessage(null);
      validateImageFileMetadata(file);
      await assertBrowserReadableImage(file);

      revokePreviewUrl();
      revokeResultUrl();
      const nextPreviewUrl = URL.createObjectURL(file);
      previewUrlRef.current = nextPreviewUrl;

      setSelectedFile(file);
      setPreviewUrl(nextPreviewUrl);
      setAnalysis(null);
      setInitialCategory(null);
      setSelectedCategory("other");
      setCustomDesignRequest("");
      setResultImageUrl(null);
      setDesignExplanation(null);
      generationLockedRef.current = false;
      setStep("upload");
    } catch (error) {
      setErrorMessage(getClientErrorMessage(error));
    }
  }

  async function handleAnalyze() {
    if (!selectedFile || analyzeInFlightRef.current) {
      return;
    }

    try {
      analyzeInFlightRef.current = true;
      setIsAnalyzing(true);
      setErrorMessage(null);
      setStep("analyzing");

      const optimizedFile = await optimizeImageForAnalysis(selectedFile);
      validateImageFileMetadata(optimizedFile);

      const formData = new FormData();
      formData.append("image", optimizedFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as ApiResponse<BuildingAnalysis>;
      if (!response.ok || !payload.success) {
        throw new Error(!payload.success ? payload.error.message : "분석 요청 실패");
      }

      const parsedAnalysis = buildingAnalysisSchema.parse(payload.data);
      if (!parsedAnalysis.isRelevantPhoto) {
        throw new AppError(
          "NOT_RELEVANT",
          "건물이나 창문을 확인하기 어렵습니다.\n건물 정면과 창문이 선명하게 보이는 사진을 사용해주세요.",
          400,
        );
      }

      setAnalysis(parsedAnalysis);
      setInitialCategory(parsedAnalysis.primaryCategory);
      setSelectedCategory(parsedAnalysis.primaryCategory);
      generationLockedRef.current = false;
      setStep("analysis");
    } catch (error) {
      setErrorMessage(getClientErrorMessage(error));
      setStep("upload");
    } finally {
      analyzeInFlightRef.current = false;
      setIsAnalyzing(false);
    }
  }

  async function handleGenerate() {
    if (
      !analysis ||
      !initialCategory ||
      generateInFlightRef.current ||
      generationLockedRef.current
    ) {
      return;
    }

    try {
      generateInFlightRef.current = true;
      setIsGenerating(true);
      setErrorMessage(null);
      setStep("generating");

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysis,
          selectedCategory,
          customDesignRequest,
          generationMode: "sticker-design",
        }),
      });

      if (!response.ok) {
        throw new Error(await readJsonError(response));
      }

      const blob = await response.blob();
      if (blob.size <= 0) {
        throw new Error("이미지 생성 결과에 이미지가 없습니다.");
      }

      revokeResultUrl();
      const nextResultUrl = URL.createObjectURL(blob);
      resultImageUrlRef.current = nextResultUrl;

      setResultImageUrl(nextResultUrl);
      setDesignExplanation(
        buildDesignExplanation({
          analysis,
          initialCategory,
          selectedCategory,
          customDesignRequest,
        }),
      );
      generationLockedRef.current = true;
      setStep("result");
    } catch (error) {
      setErrorMessage(getClientErrorMessage(error));
      setStep("analysis");
    } finally {
      generateInFlightRef.current = false;
      setIsGenerating(false);
    }
  }

  function handleDownload() {
    if (resultImageUrl) {
      downloadBlobUrl(resultImageUrl, selectedCategory);
    }
  }

  function handleRestart() {
    revokePreviewUrl();
    revokeResultUrl();
    setStep("upload");
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setInitialCategory(null);
    setSelectedCategory("other");
    setCustomDesignRequest("");
    setResultImageUrl(null);
    setDesignExplanation(null);
    setErrorMessage(null);
    setIsAnalyzing(false);
    setIsGenerating(false);
    analyzeInFlightRef.current = false;
    generateInFlightRef.current = false;
    generationLockedRef.current = false;
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[900px] gap-6 px-4 py-6 sm:px-6 lg:py-8">
      <header className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase text-emerald-800">
              BirdGuard
            </p>
            <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
              버드가드
            </h1>
          </div>
          <DemoModeBadge enabled={isDemoMode} />
        </div>
        <p className="max-w-2xl text-sm leading-6 text-slate-700 sm:text-base">
          건물 사진을 분석해 조류 충돌 위험 요인을 확인하고, 선택한 카테고리에
          맞는 창문 스티커 컨셉 도안을 생성합니다.
        </p>
        <StepIndicator currentStep={step} />
      </header>

      <ErrorMessage message={errorMessage} />

      {step === "upload" ? (
        <UploadStep
          previewUrl={previewUrl}
          fileName={selectedFile?.name ?? null}
          isAnalyzing={isAnalyzing}
          onFileSelected={handleFileSelected}
          onAnalyze={handleAnalyze}
        />
      ) : null}

      {step === "analyzing" && previewUrl ? (
        <AnalyzingStep previewUrl={previewUrl} />
      ) : null}

      {step === "analysis" && previewUrl && analysis ? (
        <AnalysisStep
          previewUrl={previewUrl}
          analysis={analysis}
          selectedCategory={selectedCategory}
          customDesignRequest={customDesignRequest}
          isGenerating={isGenerating}
          onSelectedCategoryChange={setSelectedCategory}
          onCustomDesignRequestChange={setCustomDesignRequest}
          onGenerate={handleGenerate}
        />
      ) : null}

      {step === "generating" ? (
        <GeneratingStep
          selectedCategory={selectedCategory}
          customDesignRequest={customDesignRequest}
        />
      ) : null}

      {step === "result" &&
      resultImageUrl &&
      analysis &&
      initialCategory &&
      designExplanation ? (
        <ResultStep
          resultImageUrl={resultImageUrl}
          analysis={analysis}
          initialCategory={initialCategory}
          selectedCategory={selectedCategory}
          designExplanation={designExplanation}
          onDownload={handleDownload}
          onRestart={handleRestart}
        />
      ) : null}

      <footer className="pb-6 text-xs leading-5 text-slate-500">
        버드가드는 해커톤용 프로토타입입니다. 업로드 이미지와 생성 결과를 서버에
        영구 저장하지 않으며, 실제 시공 전에는 현장 환경과 관련 지침을 검토해야
        합니다.
      </footer>
    </main>
  );
}

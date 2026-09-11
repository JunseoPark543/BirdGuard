"use client";

import { Bird, HomeIcon, MapPinned, Menu, ScanLine, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnalysisStep } from "@/components/birdguard/analysis-step";
import { AnalyzingStep } from "@/components/birdguard/analyzing-step";
import { ErrorMessage } from "@/components/birdguard/error-message";
import { GeneratingStep } from "@/components/birdguard/generating-step";
import { ResultStep } from "@/components/birdguard/result-step";
import { BuddyzoneRegistration } from "@/components/birdguard/buddyzone-registration";
import { KakaoBuddyzoneMap } from "@/components/birdguard/kakao-buddyzone-map";
import { UploadStep } from "@/components/birdguard/upload-step";
import { defaultStickerPreferences, type StickerPreferences } from "@/config/sticker-catalog";
import { recommendStickers } from "@/lib/recommend-stickers";
import { buildDesignExplanation, type DesignExplanation } from "@/lib/build-design-explanation";
import { downloadBlobUrl } from "@/lib/download-image";
import { AppError } from "@/lib/errors";
import { assertBrowserReadableImage, validateImageFileMetadata } from "@/lib/file-validation";
import { optimizeImageForAnalysis } from "@/lib/optimize-image";
import type { ApiResponse } from "@/schemas/api";
import { buildingAnalysisSchema } from "@/schemas/analysis";
import type { BirdGuardStep, BuildingAnalysis, BuildingCategoryId } from "@/types/birdguard";

function errorText(error: unknown) { if (error instanceof AppError) return error.safeMessage; if (error instanceof Error) return error.message; return "알 수 없는 오류가 발생했습니다."; }
async function responseError(response: Response) { const data = (await response.json().catch(() => null)) as ApiResponse<unknown> | null; return data && !data.success ? data.error.message : "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."; }

export default function Home() {
  const [step, setStep] = useState<BirdGuardStep>("upload");
  const [file, setFile] = useState<File | null>(null); const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<BuildingAnalysis | null>(null); const [initialCategory, setInitialCategory] = useState<BuildingCategoryId | null>(null);
  const [category, setCategory] = useState<BuildingCategoryId>("other"); const [preferences, setPreferences] = useState<StickerPreferences>(defaultStickerPreferences);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const recommendations = useMemo(() => analysis ? recommendStickers(analysis, category, preferences) : [], [analysis, category, preferences]);
  const selectedSticker = recommendations.find(item => item.id === selectedStickerId) ?? recommendations[0];
  function changeCategory(value: BuildingCategoryId) { setCategory(value); setSelectedStickerId(null); }
  function changePreferences(value: StickerPreferences) { setPreferences(value); setSelectedStickerId(null); }
  const [result, setResult] = useState<string | null>(null); const [explanation, setExplanation] = useState<DesignExplanation | null>(null);
  const [error, setError] = useState<string | null>(null); const [analyzing, setAnalyzing] = useState(false); const [generating, setGenerating] = useState(false);
  const previewRef = useRef<string | null>(null); const resultRef = useRef<string | null>(null); const analyzeLock = useRef(false); const generateLock = useRef(false); const generationDone = useRef(false);
  const revoke = (ref: React.MutableRefObject<string | null>) => { if (ref.current) URL.revokeObjectURL(ref.current); ref.current = null; };
  useEffect(() => () => { revoke(previewRef); revoke(resultRef); }, []);

  async function selectFile(next: File) { try { setError(null); validateImageFileMetadata(next); await assertBrowserReadableImage(next); revoke(previewRef); revoke(resultRef); const url = URL.createObjectURL(next); previewRef.current = url; setFile(next); setPreview(url); setAnalysis(null); setSelectedStickerId(null); setPreferences(defaultStickerPreferences); setResult(null); setExplanation(null); generationDone.current = false; } catch (e) { setError(errorText(e)); } }
  async function analyze() { if (!file || analyzeLock.current) return; try { analyzeLock.current = true; setAnalyzing(true); setError(null); setStep("analyzing"); const optimized = await optimizeImageForAnalysis(file); const body = new FormData(); body.append("image", optimized); const response = await fetch("/api/analyze", { method: "POST", body }); const data = (await response.json()) as ApiResponse<BuildingAnalysis>; if (!response.ok || !data.success) throw new Error(!data.success ? data.error.message : "분석 요청 실패"); const parsed = buildingAnalysisSchema.parse(data.data); if (!parsed.isRelevantPhoto) throw new AppError("NOT_RELEVANT", "건물 정면과 창문이 선명하게 보이는 사진을 사용해 주세요.", 400); setAnalysis(parsed); setInitialCategory(parsed.primaryCategory); setCategory(parsed.primaryCategory); setStep("analysis"); } catch (e) { setError(errorText(e)); setStep("upload"); } finally { analyzeLock.current = false; setAnalyzing(false); } }
  async function generate() { if (!analysis || !initialCategory || !selectedSticker || generateLock.current || generationDone.current) return; try { generateLock.current = true; setGenerating(true); setError(null); setStep("generating"); const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ analysis, selectedCategory: category, customDesignRequest: "", generationMode: "sticker-design", stickerPreferences: preferences, selectedStickerId: selectedSticker.id }) }); if (!response.ok) throw new Error(await responseError(response)); const blob = await response.blob(); if (!blob.size) throw new Error("생성된 이미지가 없습니다."); revoke(resultRef); const url = URL.createObjectURL(blob); resultRef.current = url; setResult(url); setExplanation(buildDesignExplanation({ analysis, initialCategory, selectedCategory: category, customDesignRequest: "", recommendation: selectedSticker })); generationDone.current = true; setStep("result"); } catch (e) { setError(errorText(e)); setStep("analysis"); } finally { generateLock.current = false; setGenerating(false); } }
  function restart() { revoke(previewRef); revoke(resultRef); setStep("upload"); setFile(null); setPreview(null); setAnalysis(null); setInitialCategory(null); setCategory("other"); setPreferences(defaultStickerPreferences); setSelectedStickerId(null); setResult(null); setExplanation(null); setError(null); generationDone.current = false; }

  return <main className="site-shell">
    <header className="topbar"><button className="brand" type="button" onClick={restart}><span className="brand-mark"><Bird size={20} /></span><span><b>BirdGuard</b></span></button><button className="icon-button" type="button" aria-label="메뉴"><Menu /></button></header>
    <div className={step === "upload" ? "content" : "content content-compact"}>
      {step === "upload" && <section className="hero"><div className="hero-copy"><span className="eyebrow">BIRD-SAFE ARCHITECTURE</span><h1>조류 충돌 예방,<br /><em>버드가드가 지켜드려요!</em></h1><p>건물 사진 한 장으로 위험 요인을 분석하고, 공간에 꼭 맞는 충돌 방지 디자인을 제안합니다.</p><div className="hero-chips"><span>AI 위험도 진단</span><span>5×10cm 기준 설계</span><span>맞춤 디자인</span></div></div><div className="hero-visual"><span className="mascot-halo" aria-hidden="true" /><img src="/mascot/birdguard-front.png" alt="5×10 안전모를 쓴 버드가드 마스코트" /></div></section>}
      <ErrorMessage message={error} />
      {step === "upload" && <UploadStep previewUrl={preview} fileName={file?.name ?? null} isAnalyzing={analyzing} onFileSelected={selectFile} onAnalyze={analyze} />}
      {step === "analyzing" && preview && <AnalyzingStep previewUrl={preview} />}
      {step === "analysis" && preview && analysis && selectedSticker && <AnalysisStep previewUrl={preview} analysis={analysis} selectedCategory={category} preferences={preferences} recommendations={recommendations} selected={selectedSticker} isGenerating={generating} onSelectedCategoryChange={changeCategory} onPreferencesChange={changePreferences} onStickerChange={setSelectedStickerId} onGenerate={generate} />}
      {step === "generating" && <GeneratingStep selectedCategory={category} designName={selectedSticker?.title ?? "선택한 디자인"} />}
      {step === "result" && result && analysis && initialCategory && explanation && <ResultStep resultImageUrl={result} analysis={analysis} initialCategory={initialCategory} selectedCategory={category} designExplanation={explanation} onDownload={() => downloadBlobUrl(result, category, "svg")} onRestart={restart} onRegister={() => setStep("registration")} />}
      {step === "registration" && <BuddyzoneRegistration onBack={() => setStep("result")} />}
      {step === "buddyzone-map" && <KakaoBuddyzoneMap onBack={() => setStep("upload")} />}
      {step === "upload" && <section className="why-section"><p className="section-kicker">WHY BIRDGUARD</p><h2>왜 버드가드인가요?</h2><div className="benefit-grid"><article><ScanLine /><b>5×10cm 법칙 준수</b><p>과학적으로 검증된 안전 간격</p></article><article><Bird /><b>건물 외벽과 완벽한 조화</b><p>재질/질감 맞춤 디자인 추천</p></article><article><MapPinned /><b>실제 설치 &amp; 인증까지</b><p>버디존 등록하고 인증 받으세요!</p></article></div></section>}
    </div>
    <nav className="bottom-nav"><button className={step === "upload" ? "active" : ""} onClick={restart}><HomeIcon /><span>홈</span></button><button className={!["upload", "registration", "buddyzone-map"].includes(step) ? "active" : ""}><ScanLine /><span>분석하기</span></button><button className={["registration", "buddyzone-map"].includes(step) ? "active" : ""} onClick={() => setStep("buddyzone-map")}><MapPinned /><span>버디존</span></button><button><UserRound /><span>마이페이지</span></button></nav>
  </main>;
}

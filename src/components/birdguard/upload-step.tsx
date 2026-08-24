"use client";
import { Camera, Check, ImagePlus, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { getAcceptedFileInputValue } from "@/lib/file-validation";
type Props = { previewUrl: string | null; fileName: string | null; isAnalyzing: boolean; onFileSelected: (file: File) => void; onAnalyze: () => void };
export function UploadStep({ previewUrl, fileName, isAnalyzing, onFileSelected, onAnalyze }: Props) {
  const inputRef = useRef<HTMLInputElement>(null); const [dragging, setDragging] = useState(false); const pick = (file?: File) => file && onFileSelected(file);
  return <section className="upload-section">
    <div className="mini-features"><div><Camera /><b>AI 사진 분석</b><span>위험도 진단</span></div><div><Sparkles /><b>맞춤 디자인</b><span>공간별 추천</span></div><div><ShieldCheck /><b>설치 가이드</b><span>기준 확인</span></div></div>
    <div className={dragging ? "dropzone dragging" : "dropzone"} onDragEnter={e => {e.preventDefault(); setDragging(true)}} onDragOver={e => e.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={e => {e.preventDefault(); setDragging(false); pick(e.dataTransfer.files.item(0) ?? undefined)}}>
      {previewUrl ? <><img src={previewUrl} alt="업로드한 건물 미리보기" /><div className="preview-meta"><Check /><span>{fileName}</span></div></> : <><span className="upload-icon"><ImagePlus /></span><b>분석할 건물 사진을 올려주세요</b><p>창문과 주변 환경이 함께 보이는 사진이 좋아요.</p></>}
      <input ref={inputRef} className="sr-only" type="file" accept={getAcceptedFileInputValue()} onChange={e => pick(e.target.files?.item(0) ?? undefined)} />
      <button type="button" className="secondary-button" onClick={() => inputRef.current?.click()}>{previewUrl ? "다른 사진 선택" : "사진 선택하기"}</button>
    </div>
    <button type="button" className="primary-button" disabled={!previewUrl || isAnalyzing} onClick={onAnalyze}>{isAnalyzing ? <Loader2 className="spin" /> : <Camera />} 사진으로 분석 시작하기</button>
    <p className="privacy-note">사진은 분석에만 사용되며 서버에 영구 저장되지 않습니다.</p>
  </section>;
}

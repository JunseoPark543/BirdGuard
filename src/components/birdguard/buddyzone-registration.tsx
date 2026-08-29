"use client";

import { ArrowLeft, Camera, Check, ChevronDown, MapPin, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { KakaoBuddyzoneMap } from "@/components/birdguard/kakao-buddyzone-map";
import { KakaoAddressSearch, type SelectedAddress } from "@/components/birdguard/kakao-address-search";
import { saveBuddyzone, type BuddyzonePlace } from "@/lib/buddyzone-storage";

type PhotoFieldProps = { label: string; value: string | null; onChange: (file: File) => void };

function PhotoField({ label, value, onChange }: PhotoFieldProps) {
  const input = useRef<HTMLInputElement>(null);
  return <button type="button" className={value ? "proof-photo filled" : "proof-photo"} onClick={() => input.current?.click()}>
    {value ? <img src={value} alt={`${label} 인증 미리보기`} /> : <><Camera /><b>{label}</b><span>사진 추가</span></>}
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e => { const file = e.target.files?.item(0); if (file) onChange(file); }} />
  </button>;
}

export function BuddyzoneRegistration({ onBack }: { onBack: () => void }) {
  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [store, setStore] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [category, setCategory] = useState("");
  const [submittedPlace, setSubmittedPlace] = useState<BuddyzonePlace | null>(null);
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach(url => URL.revokeObjectURL(url)), []);
  function photo(file: File, setter: (url: string) => void) { const url = URL.createObjectURL(file); urls.current.push(url); setter(url); }
  const ready = Boolean(before && after && store.trim() && selectedAddress && category);

  function submit() {
    if (!ready || !selectedAddress) return;
    const place: BuddyzonePlace = { id: `${selectedAddress.id}-${Date.now()}`, storeName: store.trim(), address: selectedAddress.address, category, latitude: selectedAddress.latitude, longitude: selectedAddress.longitude, createdAt: new Date().toISOString() };
    saveBuddyzone(place); setSubmittedPlace(place);
  }

  if (submittedPlace) return <KakaoBuddyzoneMap selectedPlace={submittedPlace} onBack={() => setSubmittedPlace(null)} />;

  return <section className="buddyzone-page">
    <div className="registration-title"><button type="button" onClick={onBack} aria-label="이전 화면"><ArrowLeft /></button><h1>내 버디존 등록</h1><span /></div>
    <ol className="registration-progress">
      <li className="done"><span><ShoppingBag /></span><b>구매 인증</b></li><li className="active"><span><Camera /></span><b>사진 인증</b></li><li><span><MapPin /></span><b>정보 입력</b></li><li><span><Check /></span><b>완료</b></li>
    </ol>

    <div className="purchase-card"><span><ShoppingBag /></span><div><small>구매 완료</small><h2>고투명 UV 필름</h2><p>주문번호 OD-2025-0813-001</p></div><Check /></div>

    <section className="registration-section"><div className="registration-section-title"><span>1</span><div><h2>사진 인증</h2><p>설치 전과 설치 후 모습을 각각 올려주세요.</p></div></div><div className="proof-grid"><PhotoField label="설치 전" value={before} onChange={file => photo(file, setBefore)} /><PhotoField label="설치 후" value={after} onChange={file => photo(file, setAfter)} /></div></section>

    <section className="registration-section"><div className="registration-section-title"><span>2</span><div><h2>매장 정보 입력</h2><p>검색된 실제 주소를 선택하면 해당 좌표가 지도에 등록됩니다.</p></div></div><div className="registration-form"><label><span>매장명</span><input value={store} onChange={e => setStore(e.target.value)} placeholder="매장명을 입력해 주세요" /></label><label><span>주소 검색</span><KakaoAddressSearch value={selectedAddress} onSelect={address => { setSelectedAddress(address); if (!store.trim()) setStore(address.placeName); }} /></label><label><span>카테고리</span><div><select value={category} onChange={e => setCategory(e.target.value)}><option value="" disabled>카테고리 선택</option><option>카페</option><option>상점</option><option>학교</option><option>공공기관</option><option>기타</option></select><ChevronDown /></div></label></div></section>

    <button type="button" className="primary-button registration-submit" disabled={!ready} onClick={submit}>등록하고 지도에서 보기</button>
    {!ready && <p className="registration-help">사진 2장과 매장 정보를 모두 입력하면 다음 단계로 이동할 수 있어요.</p>}
  </section>;
}

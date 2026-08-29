"use client";

import { ArrowLeft, Check, MapPin, Menu, Search, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadBuddyzones, type BuddyzonePlace } from "@/lib/buddyzone-storage";
import { loadKakaoMaps, type KakaoMap, type KakaoMaps, type KakaoMarker } from "@/lib/kakao-maps";

type Props = { selectedPlace?: BuddyzonePlace; onBack: () => void };
const categories = ["전체", "카페", "상점", "학교", "공공기관", "기타"];
const safe = (value: string) => value.replace(/[<>&"']/g, "");

export function KakaoBuddyzoneMap({ selectedPlace, onBack }: Props) {
  const container = useRef<HTMLDivElement>(null); const mapRef = useRef<KakaoMap | null>(null); const markersRef = useRef<KakaoMarker[]>([]);
  const [maps, setMaps] = useState<KakaoMaps | null>(null); const [places, setPlaces] = useState<BuddyzonePlace[]>([]);
  const [focusedPlace, setFocusedPlace] = useState<BuddyzonePlace | null>(selectedPlace ?? null);
  const [activeCategory, setActiveCategory] = useState("전체"); const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [databaseStatus, setDatabaseStatus] = useState<"loading" | "ready" | "error">("loading");
  const [databaseError, setDatabaseError] = useState("");
  useEffect(() => {
    loadBuddyzones().then(data => { setPlaces(data); setFocusedPlace(current => selectedPlace ?? current ?? data[0] ?? null); setDatabaseStatus("ready"); }).catch(error => { setDatabaseError(error instanceof Error ? error.message : "Supabase 데이터를 불러오지 못했습니다."); setDatabaseStatus("error"); });
    loadKakaoMaps().then(sdk => { setMaps(sdk); setStatus("ready"); }).catch(error => setStatus(error instanceof Error && error.message.includes("키") ? "missing" : "error"));
  }, [selectedPlace]);
  const visiblePlaces = useMemo(() => places.filter(place => (activeCategory === "전체" || place.category === activeCategory) && (!query.trim() || `${place.storeName} ${place.address}`.toLowerCase().includes(query.trim().toLowerCase()))), [activeCategory, places, query]);

  useEffect(() => {
    if (!maps || !container.current) return;
    const initialPlace = selectedPlace ?? visiblePlaces[0];
    if (!mapRef.current) mapRef.current = new maps.Map(container.current, { center: new maps.LatLng(initialPlace?.latitude ?? 36.5, initialPlace?.longitude ?? 127.8), level: initialPlace ? 4 : 12 });
    markersRef.current.forEach(marker => marker.setMap(null)); markersRef.current = [];
    visiblePlaces.forEach(place => {
      const position = new maps.LatLng(place.latitude, place.longitude); const marker = new maps.Marker({ map: mapRef.current!, position, title: place.storeName });
      const info = new maps.InfoWindow({ content: `<div style="padding:8px 12px;font-size:12px;white-space:nowrap"><b>${safe(place.storeName)}</b><br/>${safe(place.category)} · 인증 버디존</div>` });
      maps.event.addListener(marker, "click", () => { setFocusedPlace(place); mapRef.current?.setCenter(position); info.open(mapRef.current!, marker); });
      if (place.id === focusedPlace?.id) info.open(mapRef.current!, marker); markersRef.current.push(marker);
    });
  }, [focusedPlace?.id, maps, selectedPlace, visiblePlaces]);

  return <section className="buddy-map-page">
    <div className="registration-title"><button type="button" onClick={onBack} aria-label="등록 화면으로"><ArrowLeft /></button><h1>버디존 지도</h1><button type="button" aria-label="메뉴"><Menu /></button></div>
    <label className="buddy-map-search"><Search /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="등록된 매장명 또는 주소 검색" aria-label="버디존 검색" /></label>
    <div className="buddy-map-categories">{categories.map(item => <button key={item} className={activeCategory === item ? "active" : ""} onClick={() => setActiveCategory(item)}>{item}</button>)}</div>
    <div className="kakao-map-wrap"><div ref={container} className="kakao-map" aria-label="카카오 버디존 지도" />
      {status === "loading" && <div className="map-state">카카오 지도를 불러오는 중입니다.</div>}
      {status === "missing" && <div className="map-state map-config"><MapPin /><b>카카오 지도 API 키가 필요합니다</b><p>Vercel Production 환경변수에<br/><code>NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY</code>를 설정하고 재배포해 주세요.</p></div>}
      {status === "error" && <div className="map-state map-config"><MapPin /><b>지도를 불러오지 못했습니다</b><p>JavaScript 키와 카카오 개발자 콘솔의 등록 도메인을 확인해 주세요.</p></div>}
      {status === "ready" && databaseStatus === "loading" && <div className="map-empty-result">Supabase에서 인증 매장을 불러오는 중입니다.</div>}
      {status === "ready" && databaseStatus === "ready" && visiblePlaces.length === 0 && <div className="map-empty-result">데이터베이스에 등록된 인증 매장이 없습니다.</div>}
      {databaseStatus === "error" && <div className="map-database-error">{databaseError}</div>}
    </div>
    {focusedPlace ? <article className="buddy-place-card certified-place-card"><div className="buddy-place-icon"><MapPin /></div><div><div className="place-title"><h2>{focusedPlace.storeName}</h2><span><Check /> 인증 매장</span></div><p>{focusedPlace.address}</p><small>{focusedPlace.category} · 설치일: {new Date(focusedPlace.createdAt).toLocaleDateString("ko-KR")}</small><div className="place-rating"><Star /> 5×10 규격 설치 인증 완료</div></div><img src="/mascot/birdyzone-certified.png" alt="버디존 인증 마스코트" /></article> : <div className="buddy-map-summary"><MapPin /><div><b>등록된 인증 매장이 없습니다</b><p>Supabase의 buddyzones 테이블에 등록된 실제 매장만 지도에 표시됩니다.</p></div></div>}
    <aside className="buddyzone-info certified-info"><img src="/mascot/birdyzone-certified.png" alt="창문 충돌 방지 시공을 인증하는 버드가드 마스코트" /><div><h2>버디존이란?</h2><p>버드가드 스티커를 설치하고 인증하면 지도에 표시되어 더 많은 사람에게 조류 친화적인 공간임을 알릴 수 있어요!</p><div><span><MapPin /><b>지도 노출</b></span><span><Check /><b>인증 현판</b></span><span><Star /><b>신뢰도 향상</b></span></div></div></aside>
  </section>;
}

"use client";

import { ArrowLeft, Check, MapPin, Menu, Search, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadBuddyzones, type BuddyzonePlace } from "@/lib/buddyzone-storage";
import { loadKakaoMaps, type KakaoMap, type KakaoMaps, type KakaoMarker } from "@/lib/kakao-maps";

type Props = { selectedPlace: BuddyzonePlace; onBack: () => void };
const categories = ["전체", "카페", "상점", "학교", "공공기관", "기타"];
const safe = (value: string) => value.replace(/[<>&"']/g, "");

export function KakaoBuddyzoneMap({ selectedPlace, onBack }: Props) {
  const container = useRef<HTMLDivElement>(null); const mapRef = useRef<KakaoMap | null>(null); const markersRef = useRef<KakaoMarker[]>([]);
  const [maps, setMaps] = useState<KakaoMaps | null>(null); const [places, setPlaces] = useState<BuddyzonePlace[]>([]);
  const [activeCategory, setActiveCategory] = useState("전체"); const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  useEffect(() => { setPlaces(loadBuddyzones()); loadKakaoMaps().then(sdk => { setMaps(sdk); setStatus("ready"); }).catch(error => setStatus(error instanceof Error && error.message.includes("키") ? "missing" : "error")); }, []);
  const visiblePlaces = useMemo(() => places.filter(place => (activeCategory === "전체" || place.category === activeCategory) && (!query.trim() || `${place.storeName} ${place.address}`.toLowerCase().includes(query.trim().toLowerCase()))), [activeCategory, places, query]);

  useEffect(() => {
    if (!maps || !container.current) return;
    if (!mapRef.current) mapRef.current = new maps.Map(container.current, { center: new maps.LatLng(selectedPlace.latitude, selectedPlace.longitude), level: 4 });
    markersRef.current.forEach(marker => marker.setMap(null)); markersRef.current = [];
    visiblePlaces.forEach(place => {
      const position = new maps.LatLng(place.latitude, place.longitude); const marker = new maps.Marker({ map: mapRef.current!, position, title: place.storeName });
      const info = new maps.InfoWindow({ content: `<div style="padding:8px 12px;font-size:12px;white-space:nowrap"><b>${safe(place.storeName)}</b><br/>${safe(place.category)} · 인증 버디존</div>` });
      if (place.id === selectedPlace.id) info.open(mapRef.current!, marker); markersRef.current.push(marker);
    });
    const focus = visiblePlaces.find(place => place.id === selectedPlace.id) ?? visiblePlaces[0];
    if (focus) mapRef.current.setCenter(new maps.LatLng(focus.latitude, focus.longitude));
  }, [maps, selectedPlace, visiblePlaces]);

  return <section className="buddy-map-page">
    <div className="registration-title"><button type="button" onClick={onBack} aria-label="등록 화면으로"><ArrowLeft /></button><h1>버디존 지도</h1><button type="button" aria-label="메뉴"><Menu /></button></div>
    <label className="buddy-map-search"><Search /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="등록된 매장명 또는 주소 검색" aria-label="버디존 검색" /></label>
    <div className="buddy-map-categories">{categories.map(item => <button key={item} className={activeCategory === item ? "active" : ""} onClick={() => setActiveCategory(item)}>{item}</button>)}</div>
    <div className="kakao-map-wrap"><div ref={container} className="kakao-map" aria-label="카카오 버디존 지도" />
      {status === "loading" && <div className="map-state">카카오 지도를 불러오는 중입니다.</div>}
      {status === "missing" && <div className="map-state map-config"><MapPin /><b>카카오 지도 API 키가 필요합니다</b><p><code>.env.local</code>에<br/><code>NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY=발급키</code>를 입력하고 서버를 다시 실행해 주세요.</p></div>}
      {status === "error" && <div className="map-state map-config"><MapPin /><b>지도를 불러오지 못했습니다</b><p>JavaScript 키와 카카오 개발자 콘솔의 등록 도메인을 확인해 주세요.</p></div>}
      {status === "ready" && visiblePlaces.length === 0 && <div className="map-empty-result">조건에 맞는 등록 버디존이 없습니다.</div>}
    </div>
    <article className="buddy-place-card"><div className="buddy-place-icon"><MapPin /></div><div><div className="place-title"><h2>{selectedPlace.storeName}</h2><span><Check /> 인증 매장</span></div><p>{selectedPlace.address}</p><small>{selectedPlace.category} · 설치일: {new Date(selectedPlace.createdAt).toLocaleDateString("ko-KR")}</small><div className="place-rating"><Star /> 브라우저에 저장된 버디존 {places.length}개</div></div></article>
    <aside className="buddyzone-info"><h2>버디존이란?</h2><p>버드가드 스티커를 설치하고 인증하면 지도에 표시되어 더 많은 사람에게 조류 친화적인 공간임을 알릴 수 있어요!</p><div><span><MapPin /><b>지도 노출</b></span><span><Check /><b>인증 현판</b></span><span><Star /><b>신뢰도 향상</b></span></div></aside>
  </section>;
}

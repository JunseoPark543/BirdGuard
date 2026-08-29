"use client";

import { ArrowLeft, Check, MapPin, Menu, Search, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type LatLngInstance = object;
type MapInstance = object;
type KakaoMaps = {
  load: (callback: () => void) => void;
  LatLng: new (latitude: number, longitude: number) => LatLngInstance;
  Map: new (container: HTMLElement, options: { center: LatLngInstance; level: number }) => MapInstance;
  Marker: new (options: { map: MapInstance; position: LatLngInstance; title?: string }) => object;
  InfoWindow: new (options: { content: string }) => { open: (map: MapInstance, marker: object) => void };
  services: { Geocoder: new () => { addressSearch: (address: string, callback: (result: Array<{ x: string; y: string }>, status: string) => void) => void }; Status: { OK: string } };
};

declare global { interface Window { kakao?: { maps: KakaoMaps } } }

type Props = { storeName: string; address: string; category: string; onBack: () => void };
const categories = ["전체", "카페", "상점", "학교", "공공기관"];

export function KakaoBuddyzoneMap({ storeName, address, category, onBack }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY;

  useEffect(() => {
    if (!key) { setStatus("missing"); return; }
    function initialize() {
      if (!window.kakao || !container.current || initialized.current) return;
      window.kakao.maps.load(() => {
        if (!window.kakao || !container.current) return;
        const maps = window.kakao.maps;
        const defaultCenter = new maps.LatLng(37.5665, 126.978);
        const map = new maps.Map(container.current, { center: defaultCenter, level: 5 });
        const fallbackPlaces = [
          { title: "버드가드 카페", lat: 37.5665, lng: 126.978 },
          { title: "버디존 상점", lat: 37.5702, lng: 126.982 },
          { title: "새숨 학교", lat: 37.5628, lng: 126.974 },
        ];
        fallbackPlaces.forEach(place => new maps.Marker({ map, position: new maps.LatLng(place.lat, place.lng), title: place.title }));
        const geocoder = new maps.services.Geocoder();
        geocoder.addressSearch(address, (result, geocodeStatus) => {
          if (geocodeStatus !== maps.services.Status.OK || !result[0]) return;
          const position = new maps.LatLng(Number(result[0].y), Number(result[0].x));
          const marker = new maps.Marker({ map, position, title: storeName });
          const safeName = storeName.replace(/[<>&"']/g, "");
          const info = new maps.InfoWindow({ content: `<div style="padding:8px 12px;font-size:12px;white-space:nowrap"><b>${safeName}</b><br/>신규 인증 버디존</div>` });
          info.open(map, marker);
        });
        initialized.current = true; setStatus("ready");
      });
    }
    if (window.kakao?.maps) { initialize(); return; }
    const existing = document.querySelector<HTMLScriptElement>("script[data-kakao-map-sdk]");
    if (existing) { existing.addEventListener("load", initialize, { once: true }); return () => existing.removeEventListener("load", initialize); }
    const script = document.createElement("script"); script.dataset.kakaoMapSdk = "true"; script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false&libraries=services`;
    script.onload = initialize; script.onerror = () => setStatus("error"); document.head.appendChild(script);
    return () => { script.onload = null; script.onerror = null; };
  }, [address, key, storeName]);

  return <section className="buddy-map-page">
    <div className="registration-title"><button type="button" onClick={onBack} aria-label="등록 화면으로"><ArrowLeft /></button><h1>버디존 지도</h1><button type="button" aria-label="메뉴"><Menu /></button></div>
    <label className="buddy-map-search"><Search /><input placeholder="매장명 또는 지역 검색" aria-label="버디존 검색" /></label>
    <div className="buddy-map-categories">{categories.map(item => <button key={item} className={activeCategory === item ? "active" : ""} onClick={() => setActiveCategory(item)}>{item}</button>)}</div>
    <div className="kakao-map-wrap">
      <div ref={container} className="kakao-map" aria-label="카카오 버디존 지도" />
      {status === "loading" && <div className="map-state">카카오 지도를 불러오는 중입니다.</div>}
      {status === "missing" && <div className="map-state map-config"><MapPin /><b>카카오 지도 API 키가 필요합니다</b><p><code>.env.local</code>에<br/><code>NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY=발급키</code>를 입력한 후 개발 서버를 다시 실행해 주세요.</p></div>}
      {status === "error" && <div className="map-state map-config"><MapPin /><b>지도를 불러오지 못했습니다</b><p>JavaScript 키와 카카오 개발자 콘솔의 등록 도메인을 확인해 주세요.</p></div>}
    </div>
    <article className="buddy-place-card"><div className="buddy-place-icon"><MapPin /></div><div><div className="place-title"><h2>{storeName}</h2><span><Check /> 인증 매장</span></div><p>{address}</p><small>{category} · 설치일: {new Date().toLocaleDateString("ko-KR")}</small><div className="place-rating"><Star /> 신규 등록 버디존</div></div></article>
    <aside className="buddyzone-info"><h2>버디존이란?</h2><p>버드가드 스티커를 설치하고 인증하면 지도에 표시되어 더 많은 사람에게 조류 친화적인 공간임을 알릴 수 있어요!</p><div><span><MapPin /><b>지도 노출</b></span><span><Check /><b>인증 현판</b></span><span><Star /><b>신뢰도 향상</b></span></div></aside>
  </section>;
}

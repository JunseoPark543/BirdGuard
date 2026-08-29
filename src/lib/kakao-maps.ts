export type KakaoPlaceSearchResult = {
  id: string;
  place_name: string;
  road_address_name: string;
  address_name: string;
  x: string;
  y: string;
};

export type KakaoLatLng = object;
export type KakaoMap = { setCenter: (position: KakaoLatLng) => void };
export type KakaoMarker = { setMap: (map: KakaoMap | null) => void };

export type KakaoMaps = {
  load: (callback: () => void) => void;
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap;
  Marker: new (options: { map: KakaoMap; position: KakaoLatLng; title?: string }) => KakaoMarker;
  InfoWindow: new (options: { content: string }) => { open: (map: KakaoMap, marker: KakaoMarker) => void };
  services: {
    Places: new () => { keywordSearch: (keyword: string, callback: (result: KakaoPlaceSearchResult[], status: string) => void) => void };
    Status: { OK: string; ZERO_RESULT: string; ERROR: string };
  };
};

declare global { interface Window { kakao?: { maps: KakaoMaps } } }

let loadingPromise: Promise<KakaoMaps> | null = null;

export function loadKakaoMaps() {
  if (typeof window === "undefined") return Promise.reject(new Error("카카오 지도는 브라우저에서만 사용할 수 있습니다."));
  if (window.kakao?.maps) return new Promise<KakaoMaps>(resolve => window.kakao?.maps.load(() => resolve(window.kakao!.maps)));
  if (loadingPromise) return loadingPromise;
  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY;
  if (!key) return Promise.reject(new Error("카카오 지도 API 키가 설정되지 않았습니다."));
  loadingPromise = new Promise<KakaoMaps>((resolve, reject) => {
    const finish = () => {
      if (!window.kakao?.maps) { reject(new Error("카카오 지도 SDK를 초기화하지 못했습니다.")); return; }
      window.kakao.maps.load(() => resolve(window.kakao!.maps));
    };
    const existing = document.querySelector<HTMLScriptElement>("script[data-kakao-map-sdk]");
    if (existing) { existing.addEventListener("load", finish, { once: true }); existing.addEventListener("error", () => reject(new Error("카카오 지도 SDK를 불러오지 못했습니다.")), { once: true }); return; }
    const script = document.createElement("script"); script.dataset.kakaoMapSdk = "true"; script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false&libraries=services`;
    script.onload = finish; script.onerror = () => reject(new Error("카카오 지도 SDK를 불러오지 못했습니다.")); document.head.appendChild(script);
  });
  return loadingPromise;
}

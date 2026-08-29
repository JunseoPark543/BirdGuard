"use client";

import { Check, Loader2, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { loadKakaoMaps, type KakaoPlaceSearchResult } from "@/lib/kakao-maps";

export type SelectedAddress = { id: string; placeName: string; address: string; latitude: number; longitude: number };
type Props = { value: SelectedAddress | null; onSelect: (address: SelectedAddress) => void };

export function KakaoAddressSearch({ value, onSelect }: Props) {
  const [query, setQuery] = useState(""); const [results, setResults] = useState<KakaoPlaceSearchResult[]>([]);
  const [loading, setLoading] = useState(false); const [message, setMessage] = useState("");
  async function search() {
    if (!query.trim()) { setMessage("주소 또는 장소명을 입력해 주세요."); return; }
    setLoading(true); setMessage(""); setResults([]);
    try {
      const maps = await loadKakaoMaps(); const places = new maps.services.Places();
      places.keywordSearch(query.trim(), (items, status) => {
        setLoading(false);
        if (status === maps.services.Status.OK) { setResults(items.slice(0, 7)); return; }
        setMessage(status === maps.services.Status.ZERO_RESULT ? "검색 결과가 없습니다. 도로명이나 장소명을 다시 확인해 주세요." : "주소 검색 중 오류가 발생했습니다.");
      });
    } catch (error) { setLoading(false); setMessage(error instanceof Error ? error.message : "주소 검색을 사용할 수 없습니다."); }
  }
  function select(item: KakaoPlaceSearchResult) {
    const selected = { id: item.id, placeName: item.place_name, address: item.road_address_name || item.address_name, latitude: Number(item.y), longitude: Number(item.x) };
    onSelect(selected); setQuery(item.place_name); setResults([]); setMessage("");
  }
  return <div className="address-search-field"><div className="address-query"><input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); void search(); } }} placeholder="도로명, 주소 또는 매장명 검색" /><button type="button" onClick={() => void search()} disabled={loading} aria-label="주소 검색">{loading ? <Loader2 className="spin" /> : <Search />}</button></div>
    {message && <p className="address-message">{message}</p>}
    {results.length > 0 && <ul className="address-results">{results.map(item => <li key={`${item.id}-${item.x}-${item.y}`}><button type="button" onClick={() => select(item)}><MapPin /><span><b>{item.place_name}</b><small>{item.road_address_name || item.address_name}</small>{item.road_address_name && <em>지번 {item.address_name}</em>}</span></button></li>)}</ul>}
    {value && <div className="selected-address"><Check /><span><b>{value.placeName}</b><small>{value.address}</small></span></div>}
  </div>;
}

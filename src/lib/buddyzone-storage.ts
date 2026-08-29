import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type BuddyzonePlace = {
  id: string;
  storeName: string;
  address: string;
  category: string;
  latitude: number;
  longitude: number;
  createdAt: string;
};

type BuddyzoneRow = {
  id: string;
  store_name: string;
  address: string;
  category: string;
  latitude: number;
  longitude: number;
  created_at: string;
};

let client: SupabaseClient | null = null;

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase URL과 Publishable Key가 설정되지 않았습니다.");
  client ??= createClient(url, key);
  return client;
}

function toPlace(row: BuddyzoneRow): BuddyzonePlace {
  return { id: row.id, storeName: row.store_name, address: row.address, category: row.category, latitude: row.latitude, longitude: row.longitude, createdAt: row.created_at };
}

export async function loadBuddyzones(): Promise<BuddyzonePlace[]> {
  const supabase = getClient();
  const { data, error } = await supabase.from("buddyzones").select("id, store_name, address, category, latitude, longitude, created_at").eq("status", "published").order("created_at", { ascending: false });
  if (error) throw new Error(`버디존 데이터를 불러오지 못했습니다: ${error.message}`);
  return (data as BuddyzoneRow[]).map(toPlace);
}

export async function saveBuddyzone(place: BuddyzonePlace): Promise<BuddyzonePlace> {
  const supabase = getClient();
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    const { error: authError } = await supabase.auth.signInAnonymously();
    if (authError) throw new Error(`익명 사용자 인증에 실패했습니다: ${authError.message}`);
  }
  const { data, error } = await supabase.from("buddyzones").insert({ id: place.id, store_name: place.storeName, address: place.address, category: place.category, latitude: place.latitude, longitude: place.longitude, status: "published" }).select("id, store_name, address, category, latitude, longitude, created_at").single();
  if (error) throw new Error(`버디존을 저장하지 못했습니다: ${error.message}`);
  return toPlace(data as BuddyzoneRow);
}

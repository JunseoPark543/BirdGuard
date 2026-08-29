export type BuddyzonePlace = {
  id: string;
  storeName: string;
  address: string;
  category: string;
  latitude: number;
  longitude: number;
  createdAt: string;
};

const STORAGE_KEY = "birdguard:buddyzones:v1";

export function loadBuddyzones(): BuddyzonePlace[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is BuddyzonePlace => {
      if (!item || typeof item !== "object") return false;
      const place = item as Partial<BuddyzonePlace>;
      return typeof place.id === "string" && typeof place.storeName === "string" && typeof place.address === "string" && typeof place.category === "string" && typeof place.latitude === "number" && typeof place.longitude === "number" && typeof place.createdAt === "string";
    });
  } catch { return []; }
}

export function saveBuddyzone(place: BuddyzonePlace) {
  const places = loadBuddyzones().filter(item => item.id !== place.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([place, ...places].slice(0, 100)));
}

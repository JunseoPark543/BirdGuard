import { Loader2 } from "lucide-react";
import { getCategoryConfig } from "@/config/categories";
import type { BuildingCategoryId } from "@/types/birdguard";

type Props = { selectedCategory: BuildingCategoryId; designName: string };
export function GeneratingStep({ selectedCategory, designName }: Props) {
  return <section className="recommend-box" aria-live="polite">
    <div className="recommend-heading"><Loader2 className="spin" /><h2>선택한 디자인을 준비하고 있습니다.</h2></div>
    <p>{getCategoryConfig(selectedCategory).labelKo} · {designName}</p>
  </section>;
}

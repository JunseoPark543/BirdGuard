import { buildingCategories } from "@/config/categories";
import type { BuildingCategoryId } from "@/types/birdguard";

type CategorySelectProps = {
  value: BuildingCategoryId;
  onChange: (value: BuildingCategoryId) => void;
  disabled?: boolean;
};

export function CategorySelect({ value, onChange, disabled }: CategorySelectProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800">
      최종 선택 카테고리
      <select
        className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as BuildingCategoryId)}
      >
        {buildingCategories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.labelKo}
          </option>
        ))}
      </select>
    </label>
  );
}

import type { BuildingCategoryId } from "@/types/birdguard";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function buildDownloadFileName(categoryId: BuildingCategoryId, date = new Date(), extension: "png" | "svg" = "png") {
  const timestamp = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");

  return `birdguard-${categoryId}-${timestamp}.${extension}`;
}

export function downloadBlobUrl(url: string, categoryId: BuildingCategoryId, extension: "png" | "svg" = "png") {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = buildDownloadFileName(categoryId, new Date(), extension);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

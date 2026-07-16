import { maxUploadSizeBytes } from "@/config/app";
import { AppError } from "@/lib/errors";

const maxLongEdge = 1600;
const jpegQuality = 0.84;

async function loadBitmap(file: File) {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, {
        imageOrientation: "from-image",
      } as ImageBitmapOptions);
    } catch {
      // Fall through to the HTMLImageElement path below.
    }
  }

  const url = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("image-load-failed"));
      element.src = url;
    });

    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function optimizeImageForAnalysis(file: File): Promise<File> {
  if (typeof window === "undefined") {
    return file;
  }

  const source = await loadBitmap(file);
  const sourceWidth = source.width;
  const sourceHeight = source.height;
  const longestEdge = Math.max(sourceWidth, sourceHeight);
  const scale = longestEdge > maxLongEdge ? maxLongEdge / longestEdge : 1;
  const targetWidth = Math.round(sourceWidth * scale);
  const targetHeight = Math.round(sourceHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d", {
    alpha: false,
  });

  if (!context) {
    return file;
  }

  context.drawImage(source, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", jpegQuality);
  });

  if (!blob) {
    return file;
  }

  if (blob.size > maxUploadSizeBytes) {
    throw new AppError(
      "FILE_TOO_LARGE",
      "최적화 후에도 이미지가 너무 큽니다. 더 작은 사진을 사용해주세요.",
      413,
    );
  }

  return new File([blob], file.name.replace(/\.[^.]+$/, "-analysis.jpg"), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

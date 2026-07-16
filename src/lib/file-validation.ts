import { appConfig, maxUploadSizeBytes } from "@/config/app";
import { AppError } from "@/lib/errors";

export const acceptedMimeTypes = appConfig.acceptedImageTypes;
export const acceptedExtensions = [".jpg", ".jpeg", ".png", ".webp"] as const;

export type FileLike = {
  name: string;
  size: number;
  type: string;
};

function hasAllowedExtension(name: string) {
  const lowerName = name.toLowerCase();
  return acceptedExtensions.some((extension) => lowerName.endsWith(extension));
}

export function validateImageFileMetadata(file: FileLike | null | undefined) {
  if (!file) {
    throw new AppError("NO_FILE", "사진을 선택해주세요.", 400);
  }

  if (file.size <= 0) {
    throw new AppError("EMPTY_FILE", "비어 있는 파일은 업로드할 수 없습니다.", 400);
  }

  if (file.size > maxUploadSizeBytes) {
    throw new AppError(
      "FILE_TOO_LARGE",
      `파일 크기는 ${appConfig.maxUploadSizeMb}MB 이하만 사용할 수 있습니다.`,
      413,
    );
  }

  if (!acceptedMimeTypes.includes(file.type as (typeof acceptedMimeTypes)[number])) {
    throw new AppError(
      "UNSUPPORTED_FILE_TYPE",
      "JPG, PNG, WebP 형식의 이미지만 사용할 수 있습니다.",
      400,
    );
  }

  if (!hasAllowedExtension(file.name)) {
    throw new AppError(
      "UNSUPPORTED_FILE_TYPE",
      "허용되지 않은 파일 확장자입니다. JPG, PNG, WebP 파일을 선택해주세요.",
      400,
    );
  }
}

export async function assertBrowserReadableImage(file: File) {
  const url = URL.createObjectURL(file);

  try {
    await new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () =>
        reject(
          new AppError(
            "INVALID_IMAGE",
            "이미지를 읽을 수 없습니다. 손상되지 않은 다른 사진을 사용해주세요.",
            400,
          ),
        );
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function getAcceptedFileInputValue() {
  return acceptedMimeTypes.join(",");
}

export const appConfig = {
  name: "버드가드",
  englishName: "BirdGuard",
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 10),
  maxCustomRequestLength: Number(process.env.MAX_CUSTOM_REQUEST_LENGTH ?? 500),
  acceptedImageTypes: ["image/jpeg", "image/png", "image/webp"],
} as const;

export const maxUploadSizeBytes =
  appConfig.maxUploadSizeMb * 1024 * 1024;

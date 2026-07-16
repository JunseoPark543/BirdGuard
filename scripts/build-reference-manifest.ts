import { createHash } from "crypto";
import { existsSync } from "fs";
import { mkdir, readFile, readdir, writeFile } from "fs/promises";
import { extname, join } from "path";

import { GoogleGenAI } from "@google/genai";

import { buildingCategories } from "../src/config/categories";
import { geminiConfig } from "../src/config/gemini";

type CachedExample = {
  hash: string;
  categoryId: string;
  fileName: string;
  features: string[];
};

type CacheFile = {
  version: 1;
  examples: Record<string, CachedExample>;
};

const root = process.cwd();
const referenceRoot = join(root, "public", "reference-images");
const manifestPath = join(root, "src", "data", "reference-manifest.json");
const cachePath = join(root, "src", "data", "reference-manifest-cache.json");
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const confirmed = process.argv.includes("--confirm");

async function readJson<T>(path: string, fallback: T): Promise<T> {
  if (!existsSync(path)) {
    return fallback;
  }

  return JSON.parse(await readFile(path, "utf8")) as T;
}

async function listImages(categoryId: string) {
  const dir = join(referenceRoot, categoryId);
  if (!existsSync(dir)) {
    return [];
  }

  const files = await readdir(dir);
  return files
    .filter((file) => supportedExtensions.has(extname(file).toLowerCase()))
    .map((file) => join(dir, file));
}

async function hashFile(path: string) {
  const buffer = await readFile(path);
  return createHash("sha256").update(buffer).digest("hex");
}

async function analyzeImage(ai: GoogleGenAI, filePath: string, categoryId: string) {
  const buffer = await readFile(filePath);
  const extension = extname(filePath).toLowerCase();
  const mimeType =
    extension === ".png"
      ? "image/png"
      : extension === ".webp"
        ? "image/webp"
        : "image/jpeg";

  const response = await ai.models.generateContent({
    model: geminiConfig.classificationModel,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              "이 이미지는 버드가드 참고 이미지입니다.",
              `카테고리 ID: ${categoryId}`,
              "건물과 창문 환경의 시각 특징만 짧은 JSON으로 반환하세요.",
              '형식: {"features":["특징1","특징2","특징3"]}',
              "마크다운 코드블록은 쓰지 마세요.",
            ].join("\n"),
          },
          {
            inlineData: {
              mimeType,
              data: buffer.toString("base64"),
            },
          },
        ],
      },
    ],
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  } as never);

  const text = (response as { text?: string }).text ?? "{\"features\":[]}";
  const parsed = JSON.parse(text.trim()) as { features?: string[] };
  return Array.isArray(parsed.features)
    ? parsed.features.filter((feature) => typeof feature === "string").slice(0, 6)
    : [];
}

async function main() {
  const cache = await readJson<CacheFile>(cachePath, {
    version: 1,
    examples: {},
  });

  const categoryImages = await Promise.all(
    buildingCategories.map(async (category) => ({
      category,
      files: await listImages(category.id),
    })),
  );

  const allFiles = categoryImages.flatMap(({ category, files }) =>
    files.map((file) => ({ category, file })),
  );
  const hashes = await Promise.all(
    allFiles.map(async (item) => ({ ...item, hash: await hashFile(item.file) })),
  );
  const pending = hashes.filter((item) => !cache.examples[item.hash]);

  console.log(`참고 이미지 전체: ${allFiles.length}개`);
  console.log(`새로 분석할 이미지: ${pending.length}개`);
  console.log(`사용 모델: ${geminiConfig.classificationModel}`);

  if (pending.length > 0 && !confirmed) {
    console.log("Gemini API 호출이 필요합니다. 실행하려면 --confirm 옵션을 추가하세요.");
    process.exit(0);
  }

  if (pending.length > 0 && !process.env.GEMINI_API_KEY) {
    throw new Error(".env.local 또는 환경변수에 GEMINI_API_KEY가 없습니다.");
  }

  const ai =
    pending.length > 0
      ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" })
      : null;

  for (const item of pending) {
    if (!ai) {
      continue;
    }

    console.log(`분석 중: ${item.category.id} / ${item.file}`);
    const features = await analyzeImage(ai, item.file, item.category.id);
    cache.examples[item.hash] = {
      hash: item.hash,
      categoryId: item.category.id,
      fileName: item.file,
      features,
    };
  }

  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    categories: Object.fromEntries(
      buildingCategories.map((category) => {
        const examples = hashes
          .filter((item) => item.category.id === category.id)
          .map((item) => cache.examples[item.hash])
          .filter(Boolean);
        const commonVisualFeatures = [
          ...new Set(examples.flatMap((example) => example.features)),
        ].slice(0, 12);

        return [
          category.id,
          {
            imageCount: examples.length,
            commonVisualFeatures,
            individualExamples: examples.map((example) => ({
              fileName: example.fileName,
              features: example.features,
            })),
          },
        ];
      }),
    ),
  };

  await mkdir(join(root, "src", "data"), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");

  console.log(`manifest 저장 완료: ${manifestPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "manifest 생성 실패");
  process.exit(1);
});

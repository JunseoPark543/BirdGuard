import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildingCategories } from "@/config/categories";
import referenceManifest from "@/data/reference-manifest.json";

type ReferenceManifest = typeof referenceManifest;

const masterDocumentPath = join(
  process.cwd(),
  "docs",
  "building-classification-master.md",
);

let cachedMasterDocument: string | undefined;

export function getBuildingClassificationMaster() {
  cachedMasterDocument ??= readFileSync(masterDocumentPath, "utf8").trim();
  return cachedMasterDocument;
}

function formatCategories() {
  return buildingCategories
    .filter((category) => category.enabled)
    .map((category) =>
      [
        `- ${category.id} (${category.labelKo}/${category.labelEn})`,
        `  설명: ${category.description}`,
        `  우선순위: ${category.priority}`,
        `  시각 단서: ${category.visualCues.join(", ")}`,
        `  제외 단서: ${category.negativeCues.join(", ")}`,
      ].join("\n"),
    )
    .join("\n");
}

function formatReferenceFeatures(manifest: ReferenceManifest) {
  const entries = Object.entries(manifest.categories)
    .filter(([, value]) => value.imageCount > 0)
    .map(([categoryId, value]) => {
      const features = value.commonVisualFeatures.join(", ");
      return `- ${categoryId}: ${features || "추출된 공통 특징 없음"}`;
    });

  if (entries.length === 0) {
    return "현재 참고 이미지 manifest에는 추출된 특징이 없습니다. 카테고리 설정 기준만 사용하세요.";
  }

  return entries.join("\n");
}

export function buildClassificationPrompt(manifest: ReferenceManifest = referenceManifest) {
  return `
너는 조류 충돌 방지 디자인을 돕는 건물 사진 분석 AI다.
업로드된 사진 한 장만 보고 건물 또는 투명 방음벽 환경을 분석한다.

${getBuildingClassificationMaster()}

[중요 응답 원칙]
1. 사진에서 실제로 보이는 근거만 사용한다.
2. 보이지 않는 정보를 사실처럼 만들지 않는다.
3. 건물 용도, 실제 면적, 반사율, 거리 또는 층수를 확정하기 어려우면 추정이라고 밝힌다.
4. 대표 카테고리는 반드시 하나만 선택한다. 불명확하면 other를 선택한다.
5. 보조 카테고리는 최대 3개이며 대표 카테고리와 중복하지 않는다.
6. 신뢰도는 0부터 100 사이 정수로 과도하게 높게 잡지 않는다.
7. 모든 설명은 짧고 명확한 한국어로 작성한다.
8. 마크다운 코드 블록 없이 JSON 객체만 반환한다.

[카테고리 설정]
${formatCategories()}

[참고 이미지의 텍스트 특징]
${formatReferenceFeatures(manifest)}

[응답 JSON 규칙]
- schemaVersion은 1이다.
- primaryCategory는 commercial, transparent-barrier, glass-facade, university, near-nature, residential, special, other 중 하나다.
- secondaryCategories는 최대 3개다.
- classificationConfidence와 secondaryCategories.confidence는 0부터 100 사이 정수다.
- 문자열과 배열은 핵심 항목만 짧게 작성한다.
`.trim();
}

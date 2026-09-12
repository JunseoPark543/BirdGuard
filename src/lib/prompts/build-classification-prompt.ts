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
9. 사진에서 실제 유리창 또는 투명 패널로 확인되는 영역만 glassRegions에 다각형으로 반환한다.
10. glassRegions의 polygon은 사진 전체를 기준으로 정규화한 [x, y] 좌표이며 각 값은 0부터 1000 사이다. 창틀, 벽, 지붕, 하늘, 나무는 포함하지 않는다.
11. 서로 떨어진 유리 면은 별도 영역으로 나누고, 유리 영역을 신뢰성 있게 찾지 못하면 glassRegions를 빈 배열로 반환한다. 사진 전체나 건물 전체를 유리 영역으로 지정하지 않는다.

[카테고리 설정]
${formatCategories()}

[참고 이미지의 텍스트 특징]
${formatReferenceFeatures(manifest)}

[응답 JSON 규칙]
- JSON 키와 지정된 enum 값은 그대로 유지하되, 사용자에게 보이는 자유 서술 값은 모두 한국어로 작성한다.
- 한국어 작성 대상: imageQualityReason, classificationReason, buildingUse, estimatedFloorCount.explanation, riskFactors의 각 항목, environmentTags의 각 항목, analyzedEvidence의 각 항목, designConsiderations의 각 항목, glassRegions.label, caution.
- buildingUse는 "Residential" 대신 "주거용 건물로 추정", riskFactors는 "Large glass panels" 대신 "넓은 유리 패널"처럼 작성한다. 영어 원문이나 영어 번역을 괄호 안에 덧붙이지 않는다.
- AI, UV 및 cm, mm, m 같은 길이·면적 단위만 한국어 설명 안에서 영문으로 표기할 수 있다. 그 밖의 영어 용어는 한국어로 풀어 쓴다.
- schemaVersion은 1이다.
- primaryCategory는 commercial, transparent-barrier, glass-facade, university, near-nature, residential, special, other 중 하나다.
- secondaryCategories는 최대 3개다.
- classificationConfidence와 secondaryCategories.confidence는 0부터 100 사이 정수다.
- 문자열과 배열은 핵심 항목만 짧게 작성한다.
- glassRegions는 최대 30개이며, 각 항목은 label, confidence, polygon을 포함한다. polygon은 최소 3개의 [x, y] 점으로 구성한다.
`.trim();
}

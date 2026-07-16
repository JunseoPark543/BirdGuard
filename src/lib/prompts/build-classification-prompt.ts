import { buildingCategories } from "@/config/categories";
import referenceManifest from "@/data/reference-manifest.json";

type ReferenceManifest = typeof referenceManifest;

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
업로드된 사진 한 장만 보고 건물 또는 투명 방벽 환경을 분석한다.

[중요 규칙]
1. 사진에서 실제로 보이는 근거만 사용한다.
2. 보이지 않는 정보를 사실처럼 만들지 않는다.
3. 건물 용도와 층수를 확신하기 어려우면 반드시 추정이라고 쓴다.
4. 창문, 투명 유리 구조, 유리 반사, 하늘 반사, 주변 식생을 우선 확인한다.
5. 조류 충돌 위험도는 사진 기반 AI 추정이라고 설명한다.
6. 대표 카테고리는 반드시 하나만 선택한다.
7. 판단이 어렵거나 명확하지 않으면 other를 선택한다.
8. 보조 카테고리는 최대 3개이며 대표 카테고리와 중복하지 않는다.
9. 신뢰도는 0부터 100 사이 정수이며 과도하게 높게 쓰지 않는다.
10. 모든 설명은 쉬운 한국어로 작성한다.
11. 마크다운 코드블록 없이 JSON 객체만 반환한다.
12. 답변을 불필요하게 길게 작성하지 않는다.

[카테고리 설정]
${formatCategories()}

[참고 이미지 텍스트 특징]
${formatReferenceFeatures(manifest)}

[분석 항목]
- 건물 또는 투명 방벽 사진인지
- 사진 품질과 그 이유
- 건물 용도 또는 추정 용도
- 창문 크기, 유리 반사도, 주변 식생, 하늘 반사
- 예상 층수. 모르면 null과 설명을 사용
- 조류 충돌 위험도와 주요 위험 요인
- 대표 카테고리와 보조 카테고리
- 환경 태그
- 사진에서 확인한 분류 근거
- 스티커 디자인에 반영할 요소

[응답 JSON 규칙]
schemaVersion은 1이다.
primaryCategory는 commercial, transparent-barrier, glass-facade, university, near-nature, residential, special, other 중 하나다.
secondaryCategories는 최대 3개다.
classificationConfidence와 secondaryCategories.confidence는 0부터 100 사이 정수다.
문자열 배열은 핵심 항목만 짧게 작성한다.
`.trim();
}

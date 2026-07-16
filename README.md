# 버드가드(BirdGuard)

건물 사진을 업로드하면 건물과 창문 환경을 분석하고, 조류 충돌 방지용 창문 스티커 컨셉 도안을 생성하는 해커톤용 웹 프로토타입입니다.

현재 결과물은 건물 사진에 합성된 목업이 아니라, 1:1 정사각형 스티커 디자인 도안 1장입니다.

## 현재 구현 기능

- JPG, PNG, WebP 건물 사진 업로드
- 업로드 이미지 미리보기
- 클라이언트와 서버 양쪽 파일 검증
- 분석 전 클라이언트 이미지 최적화
- Gemini 서버 Route Handler 기반 건물 분석
- Zod 기반 구조화 분석 결과 검증
- 8개 카테고리 중 대표 카테고리 자동 분류
- 보조 카테고리, 분류 근거, 위험 요인, 디자인 반영 요소 표시
- 사용자의 최종 카테고리 수정
- 추가 디자인 조건 입력
- Gemini 이미지 모델 기반 스티커 디자인 생성
- 데모 모드에서 API 키 없이 전체 흐름 실행
- 생성 이미지 미리보기와 다운로드
- 처음부터 다시 시작
- 참고 이미지 manifest 생성 스크립트
- Vercel 배포 가능한 App Router 구조

## 구현하지 않은 기능

- 카메라 직접 촬영
- 실제 건물 창문 위 스티커 합성
- 이미지 다시 생성
- 여러 시안 비교
- 결과 공유
- 이전 생성 기록
- 로그인
- 관리자 페이지
- Supabase 또는 별도 데이터베이스
- 이미지 영구 저장
- 실제 모델 학습 또는 파인튜닝

## 기술 스택

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- 공식 Google GenAI JavaScript SDK `@google/genai`
- Zod
- Vitest
- ESLint
- Vercel Node.js Route Handler

## 프로젝트 구조

```text
src/app/api/analyze/route.ts       건물 분석 API
src/app/api/generate/route.ts      스티커 이미지 생성 API
src/components/birdguard/          단계별 UI 컴포넌트
src/config/categories.ts           건물 카테고리 설정
src/config/sticker-rules.ts        스티커 디자인 규칙 설정
src/config/gemini.ts               Gemini 모델과 비용 제한 설정
src/schemas/                       Zod 스키마
src/lib/gemini/                    Gemini 서버 호출 래퍼
src/lib/prompts/                   분석/이미지 생성 프롬프트 빌더
src/mocks/building-analysis.ts     데모 모드 분석 응답
src/data/reference-manifest.json   참고 이미지 특징 manifest
scripts/build-reference-manifest.ts 참고 이미지 manifest 생성 스크립트
public/mock/sticker-result.svg     데모 모드 스티커 샘플
public/reference-images/           카테고리별 참고 이미지 폴더
```

## 시작하기

Node.js 설치 확인:

```bash
node --version
npm --version
```

PowerShell에서 `npm` 실행이 막히면 아래처럼 `npm.cmd`를 사용하세요.

```powershell
npm.cmd --version
```

패키지 설치:

```bash
npm install
```

데모 모드 실행:

```bash
npm run dev
```

PowerShell 실행 정책 문제를 피하려면:

```powershell
npm.cmd run dev
```

브라우저에서 표시된 로컬 주소를 열면 됩니다. 기본 개발 주소는 보통 `http://localhost:3000`입니다.

## 환경변수

`.env.example`을 참고해 `.env.local`을 만듭니다. 실제 API 키는 반드시 `.env.local`에만 넣고 커밋하지 마세요.

```env
GEMINI_API_KEY=
GEMINI_CLASSIFICATION_MODEL=gemini-3.1-flash-lite
GEMINI_IMAGE_MODEL=gemini-3.1-flash-lite-image
GEMINI_IMAGE_SIZE=1K

MOCK_GEMINI=true
NEXT_PUBLIC_DEMO_MODE=true

MAX_UPLOAD_SIZE_MB=10
MAX_CUSTOM_REQUEST_LENGTH=500
```

데모 모드:

```env
MOCK_GEMINI=true
NEXT_PUBLIC_DEMO_MODE=true
```

실제 Gemini 모드:

```env
MOCK_GEMINI=false
NEXT_PUBLIC_DEMO_MODE=false
GEMINI_API_KEY=발급받은_키
```

`MOCK_GEMINI=false`인데 `GEMINI_API_KEY`가 없으면 가짜 데이터를 반환하지 않고 설정 오류를 표시합니다.

## Gemini API 준비

1. Google AI Studio에서 API 키를 발급합니다.
2. 이미지 생성 모델 사용을 위해 결제 또는 사용 권한이 필요한지 확인합니다.
3. Gemini API 가격과 무료 티어 조건은 바뀔 수 있으므로 공식 가격표를 확인합니다.
4. 이미지 생성 모델은 무료 티어가 없거나 제한이 다를 수 있습니다.

공식 가격표:

```text
https://ai.google.dev/gemini-api/docs/pricing
```

## 비용 절감 방식

- 건물 분석 모델: `gemini-3.1-flash-lite`
- 이미지 생성 모델: `gemini-3.1-flash-lite-image`
- 이미지 해상도: `1K`
- 한 요청당 이미지: 1장
- 이미지 생성 자동 retry: 없음
- 고급 모델 자동 폴백: 없음
- Google Search Grounding: 사용 안 함
- build 과정의 Gemini 호출: 없음
- 결과 설명 생성용 추가 Gemini 호출: 없음
- 업로드 사진과 생성 결과의 서버 영구 저장: 없음

분석 JSON 검증 실패 시에만 분석 요청을 최대 1회 추가 시도할 수 있습니다. 이미지 생성은 실패해도 자동으로 다시 호출하지 않습니다.

## 카테고리 수정

건물 분류 카테고리는 아래 파일에서 수정합니다.

```text
src/config/categories.ts
```

현재 카테고리:

- 상가
- 투명 방벽
- 통유리창
- 대학교 건물
- 자연 근처 건물
- 주거지
- 특수 건물
- 기타

`special` 카테고리는 정의가 확정되지 않았으므로 TODO 주석을 기준으로 쉽게 바꿀 수 있습니다.

## 스티커 디자인 규칙 수정

카테고리별 디자인 규칙은 아래 파일에서 수정합니다.

```text
src/config/sticker-rules.ts
```

여기서 모티프, 색상, 구성 방식, 필수 요소, 금지 요소, 타일형 패턴 여부 등을 바꿀 수 있습니다. 현재 실제 규격이 정해지지 않은 값은 `운영자가 설정한 규격 없음`으로 표시했습니다.

## 참고 이미지 추가와 manifest 생성

참고 이미지는 아래 폴더에 카테고리별로 넣습니다.

```text
public/reference-images/commercial/
public/reference-images/transparent-barrier/
public/reference-images/glass-facade/
public/reference-images/university/
public/reference-images/near-nature/
public/reference-images/residential/
public/reference-images/special/
public/reference-images/other/
```

JPG, PNG, WebP를 권장합니다. 같은 사진을 과도하게 많이 넣지 말고, 카테고리를 대표하는 다양한 예시를 넣어주세요.

manifest 생성:

```bash
npm run references:build -- --confirm
```

이 명령은 Gemini API를 호출하므로 비용이 발생할 수 있습니다. `npm run dev`, `npm run build`, Vercel 배포 중에는 자동 실행되지 않습니다. 이미 처리한 파일은 해시 기반 캐시로 다시 분석하지 않습니다.

이 기능은 모델 학습이나 파인튜닝이 아닙니다. 참고 이미지를 한 번 분석해 텍스트 특징을 저장하고, 런타임에는 그 텍스트만 프롬프트에 넣어 비용을 줄이는 방식입니다.

## Vercel 배포

1. 프로젝트를 GitHub 저장소에 올립니다.
2. Vercel에서 새 프로젝트를 연결합니다.
3. Environment Variables에 필요한 값을 등록합니다.
4. 실제 API 모드라면 `GEMINI_API_KEY`, `MOCK_GEMINI=false`, `NEXT_PUBLIC_DEMO_MODE=false`를 설정합니다.
5. 배포합니다.

API Route는 Node.js runtime으로 설정되어 있습니다.

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
```

참고 이미지 manifest 스크립트는 배포 과정에서 자동 실행하지 않습니다. 이미지 생성 요청은 일반 텍스트 요청보다 오래 걸릴 수 있으므로 현재 Vercel 플랜의 함수 실행 시간 제한을 확인하세요.

## 자주 발생하는 오류

`Gemini API 키가 설정되지 않았습니다.`

- `.env.local`에 `GEMINI_API_KEY`가 있는지 확인합니다.
- 실제 모드에서는 `MOCK_GEMINI=false`로 설정되어 있는지 확인합니다.

`JPG, PNG, WebP 형식의 이미지만 사용할 수 있습니다.`

- 지원하지 않는 형식이거나 확장자와 MIME 타입이 맞지 않을 수 있습니다.

`이미지 생성 요청을 처리하지 못했습니다.`

- Gemini API 결제 설정과 이미지 모델 사용 권한을 확인합니다.
- 이미지 생성 모델의 무료 티어 또는 제공 조건이 바뀌었을 수 있습니다.

`건물이나 창문을 확인하기 어렵습니다.`

- 건물 정면과 창문이 선명하게 보이는 사진을 사용합니다.
- 지나치게 흐리거나 어두운 사진은 피합니다.

## 추후 건물 합성 기능 위치

타입은 이미 확장 지점을 갖고 있습니다.

```ts
export type GenerationMode =
  | "sticker-design"
  | "building-mockup";
```

현재 API는 `sticker-design`만 허용합니다. 추후 실제 건물 창문 위 합성 기능은 `src/lib/gemini/generate-sticker.ts`, `src/lib/prompts/build-sticker-prompt.ts`, `src/app/api/generate/route.ts`를 확장해 추가할 수 있습니다.

## 보안과 개인정보

- API 키에 `NEXT_PUBLIC_` 접두사를 붙이지 마세요.
- Gemini 호출은 서버 Route Handler에서만 수행합니다.
- 클라이언트 번들에 API 키가 포함되지 않습니다.
- 서버 오류 응답에 API 키, 내부 프롬프트, 원본 Gemini 응답을 포함하지 않습니다.
- 로그에 이미지 base64, 사용자 이미지 전체, 민감한 환경변수를 기록하지 않습니다.
- 업로드 사진과 생성 결과는 서버 또는 데이터베이스에 영구 저장하지 않습니다.

## 검증 명령어

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

PowerShell에서 실행 정책 문제가 있으면:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

## 주의사항

- 이 프로젝트는 해커톤용 프로토타입입니다.
- 클라이언트 중복 클릭 방지는 비용 절감 보조 장치이며, 인증 기반 사용량 제한 시스템은 아닙니다.
- API 가격과 모델 제공 조건은 바뀔 수 있습니다.
- AI 사진 분석은 현장 조사나 전문 인증을 대체하지 않습니다.
- 생성 결과는 컨셉 시안입니다.
- 실제 제작과 시공 전에는 현장 환경, 관련 지침, 법규, 안전 기준을 별도로 검토해야 합니다.

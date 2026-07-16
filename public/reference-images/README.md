# 버드가드 참고 이미지 폴더

이 폴더는 카테고리별 참고 사진을 보관하는 위치입니다.

카테고리별 폴더:

- `commercial`: 상가
- `transparent-barrier`: 투명 방벽
- `glass-facade`: 통유리창
- `university`: 대학교 건물
- `near-nature`: 자연 근처 건물
- `residential`: 주거지
- `special`: 특수 건물
- `other`: 기타

사진은 JPG, PNG, WebP 형식을 권장합니다. 같은 장소에서 거의 똑같이 찍은 사진을 너무 많이 넣으면 특징이 한쪽으로 치우칠 수 있으므로, 각 카테고리의 다양한 예시를 적당히 넣어주세요.

파일명 예시:

```text
university-main-library-01.jpg
glass-facade-office-south-02.webp
near-nature-river-building-01.png
```

참고 이미지 특징 manifest는 아래 명령으로 직접 생성합니다.

```bash
npm run references:build -- --confirm
```

이 명령은 Gemini API를 호출하므로 비용이 발생할 수 있습니다. `npm run dev`, `npm run build`, Vercel 배포 과정에서는 자동 실행되지 않습니다.

이 방식은 실제 모델 학습이나 파인튜닝이 아닙니다. 이미지를 한 번 분석해 텍스트 특징을 `src/data/reference-manifest.json`에 저장하고, 이후 런타임 분류 프롬프트에 그 텍스트만 참고하는 비용 절감 방식입니다.

import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "버드가드 BirdGuard",
  description: "건물 사진 기반 조류 충돌 방지 스티커 컨셉 생성 프로토타입",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

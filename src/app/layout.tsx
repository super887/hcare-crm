import type { Metadata } from "next";
import "./globals.css";
import { DemoToolbar } from "@/components/demo/DemoToolbar";

export const metadata: Metadata = {
  title: "Hcare CRM - 바디케어 고객관리 데모",
  description: "1:1 맞춤형 바디케어·운동 지도 고객관리 웹앱 MVP 데모",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <DemoToolbar />
        {children}
      </body>
    </html>
  );
}

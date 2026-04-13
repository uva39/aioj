import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "AIOJ — AI/ML 알고리즘 구현 온라인 저지",
  description:
    "numpy/pandas만으로 AI/ML 알고리즘을 직접 구현하고 채점받는 학습 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1f2937",
                color: "#f3f4f6",
                border: "1px solid #374151",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

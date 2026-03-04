import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { SHARED_GREETING } from "@creator/shared";

console.log(SHARED_GREETING);
import { Providers } from "./providers";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "600", "700"]
});

export const metadata: Metadata = {
  title: "クリエイター登録 | Micro Funding",
  description:
    "独自ドメインとアダルト対応決済で、クリエイターが安全に収益化できるプラットフォーム。",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={notoSans.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

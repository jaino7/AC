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
  title: "Cocoba　ココバ",
  description:
    "クリエイターの利益を最大化する独立型プラットフォーム「CocoBa（ココバ）」。業界最安水準の手数料2.8%〜を実現。既存サイトの厳しい規制やルールに縛られず、自由な表現と高い還元率であなたの創作活動を加速させます。自分だけのファンコミュニティを今すぐ。",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
    ],
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

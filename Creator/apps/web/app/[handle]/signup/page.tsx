import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ThemeSignupWrapper } from "./theme-wrapper";

interface SignupPageProps {
    params: { handle: string };
}

export default async function SignupPage({ params }: SignupPageProps) {
    // クリエイター情報を取得
    const creator = await prisma.creatorProfile.findUnique({
        where: { handle: params.handle },
        select: {
            handle: true,
            theme: true,
            displayName: true,
            logoUrl: true
        }
    });

    if (!creator) {
        notFound();
    }

    // テーマに応じたサインアップページをラッパー経由でレンダリング（リダイレクトなし）
    return <ThemeSignupWrapper
        handle={creator.handle}
        theme={creator.theme}
        displayName={creator.displayName}
        logoUrl={creator.logoUrl}
    />;
}

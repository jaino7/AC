import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ThemeLoginWrapper } from "./theme-wrapper";

interface LoginPageProps {
    params: { handle: string };
}

export default async function LoginPage({ params }: LoginPageProps) {
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

    // テーマに応じたログインページをラッパー経由でレンダリング（リダイレクトなし）
    return <ThemeLoginWrapper
        handle={creator.handle}
        theme={creator.theme}
        displayName={creator.displayName}
        logoUrl={creator.logoUrl}
    />;
}

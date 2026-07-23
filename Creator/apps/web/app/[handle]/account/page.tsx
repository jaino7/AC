import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ThemeAccountWrapper } from "./theme-wrapper";

interface AccountPageProps {
    params: { handle: string };
}

export default async function AccountPage({ params }: AccountPageProps) {
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

    // テーマに応じたアカウントページをラッパー経由でレンダリング
    return <ThemeAccountWrapper
        handle={creator.handle}
        theme={creator.theme}
        displayName={creator.displayName}
        logoUrl={creator.logoUrl}
    />;
}

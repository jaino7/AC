import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ThemeContentWrapper } from "./theme-wrapper";

interface ContentPageProps {
    params: { handle: string };
}

export default async function Page({ params }: ContentPageProps) {
    // クリエイター情報を取得
    const creator = await prisma.creatorProfile.findUnique({
        where: { handle: params.handle },
        select: {
            handle: true,
            theme: true
        }
    });

    if (!creator) {
        notFound();
    }

    // テーマに応じたコンテンツページをラッパー経由でレンダリング（リダイレクトなし）
    return <ThemeContentWrapper handle={creator.handle} theme={creator.theme} />;
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

interface ContentPageProps {
    params: { handle: string };
}

// テーマごとのコンテンツページコンポーネントを動的インポート
const themeContentPages: Record<string, React.ComponentType> = {
    "neon-pro": dynamic(() => import("@/app/neon-pro/content/page")),
    "pure-lite": dynamic(() => import("@/app/pure-lite/content/page")),
    "zine-lite": dynamic(() => import("@/app/zine-lite/content/page")),
    "creator-pro": dynamic(() => import("@/app/creator-pro/content/page")),
    "velvet-pro": dynamic(() => import("@/app/velvet-pro/content/page")),
    "studio-pro": dynamic(() => import("@/app/studio-pro/content/page")),
};

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

    // テーマに応じたコンテンツページコンポーネントを取得
    const ThemeContentPage = themeContentPages[creator.theme] || themeContentPages["creator-pro"];

    return <ThemeContentPage />;
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

interface SignupPageProps {
    params: { handle: string };
}

// テーマごとのサインアップページコンポーネントを動的インポート
const themeSignupPages: Record<string, React.ComponentType> = {
    "neon-pro": dynamic(() => import("@/app/neon-pro/signup/page")),
    "pure-lite": dynamic(() => import("@/app/pure-lite/signup/page")),
    "zine-lite": dynamic(() => import("@/app/zine-lite/signup/page")),
    "creator-pro": dynamic(() => import("@/app/creator-pro/signup/page")),
    "velvet-pro": dynamic(() => import("@/app/velvet-pro/signup/page")),
    "studio-pro": dynamic(() => import("@/app/studio-pro/signup/page")),
};

export default async function SignupPage({ params }: SignupPageProps) {
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

    // テーマに応じたサインアップページコンポーネントを取得
    const ThemeSignupPage = themeSignupPages[creator.theme] || themeSignupPages["creator-pro"];

    return <ThemeSignupPage />;
}

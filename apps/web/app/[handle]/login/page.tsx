import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

interface LoginPageProps {
    params: { handle: string };
}

// テーマごとのログインページコンポーネントを動的インポート
const themeLoginPages: Record<string, React.ComponentType> = {
    "neon-pro": dynamic(() => import("@/app/neon-pro/login/page")),
    "pure-lite": dynamic(() => import("@/app/pure-lite/login/page")),
    "zine-lite": dynamic(() => import("@/app/zine-lite/login/page")),
    "creator-pro": dynamic(() => import("@/app/creator-pro/login/page")),
    "velvet-pro": dynamic(() => import("@/app/velvet-pro/login/page")),
    "studio-pro": dynamic(() => import("@/app/studio-pro/login/page")),
};

export default async function LoginPage({ params }: LoginPageProps) {
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

    // テーマに応じたログインページコンポーネントを取得
    const ThemeLoginPage = themeLoginPages[creator.theme] || themeLoginPages["creator-pro"];

    return <ThemeLoginPage />;
}

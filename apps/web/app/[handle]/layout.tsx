import { prisma } from "@creator/shared";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { HandleSessionProvider } from "./providers";

// テーマに対応するレイアウトスタイル
const themeStyles: Record<string, { bg: string; accent: string }> = {
    "neon-pro": { bg: "bg-[#041024]", accent: "cyan" },
    "pure-lite": { bg: "bg-gradient-to-br from-pink-50 to-white", accent: "pink" },
    "zine-lite": { bg: "bg-gradient-to-br from-emerald-50 to-white", accent: "emerald" },
    "creator-pro": { bg: "bg-gradient-to-br from-slate-900 to-slate-800", accent: "cyan" },
    "velvet-pro": { bg: "bg-gradient-to-br from-amber-50 to-white", accent: "amber" },
    "studio-pro": { bg: "bg-gradient-to-br from-slate-100 to-white", accent: "blue" },
};

interface HandleLayoutProps {
    children: React.ReactNode;
    params: { handle: string };
}

// メタデータを動的に生成
export async function generateMetadata({ params }: HandleLayoutProps): Promise<Metadata> {
    const creator = await prisma.creatorProfile.findUnique({
        where: { handle: params.handle },
        select: { displayName: true, bio: true }
    });

    if (!creator) {
        return { title: "Not Found" };
    }

    return {
        title: creator.displayName,
        description: creator.bio || `${creator.displayName}のファンサイト`
    };
}

export default async function HandleLayout({ children, params }: HandleLayoutProps) {
    // クリエイターを取得
    const creator = await prisma.creatorProfile.findUnique({
        where: { handle: params.handle },
        select: {
            id: true,
            handle: true,
            displayName: true,
            theme: true,
            logoUrl: true,
            faviconUrl: true
        }
    });

    // クリエイターが見つからない場合は404
    if (!creator) {
        notFound();
    }

    const themeStyle = themeStyles[creator.theme] || themeStyles["creator-pro"];

    return (
        <HandleSessionProvider>
            <div className={`min-h-screen ${themeStyle.bg}`}>
                {/* クリエイター情報をコンテキストとして渡す */}
                <div data-creator-id={creator.id} data-creator-handle={creator.handle} data-theme={creator.theme}>
                    {children}
                </div>
            </div>
        </HandleSessionProvider>
    );
}

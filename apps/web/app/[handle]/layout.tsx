import { prisma } from "@creator/shared";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
// import { HandleSessionProvider } from "./providers";
import { CustomSessionProvider } from "@/components/providers/handle-session-provider";
// DebugSessionコンポーネントを削除
// import { DebugSession } from "@/components/debug-session";

// export const revalidate = 0; // 常に最新のデータを取得
export const dynamic = "force-dynamic"; // キャッシュを無効化し、常に動的にレンダリング

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

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { unstable_noStore as noStore } from "next/cache";

export default async function HandleLayout({ children, params }: HandleLayoutProps) {
    noStore(); // データのキャッシュを無効化
    const session = await getServerSession(authOptions);
    // デバッグログ削除

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

    // Check if fan account is locked
    if (session?.user) {
        const userId = (session.user as any).id;

        // Skip check for public pages (login, signup, etc.)
        const publicPaths = ['/login', '/signup', '/password-reset', '/verify-email'];
        const isPublicPath = publicPaths.some((p: string) => params.handle.endsWith(p));

        if (userId && !isPublicPath) {
            const fanProfile = await prisma.fanProfile.findFirst({
                where: {
                    userId: userId,
                    creatorId: creator.id
                },
                select: { isLocked: true }
            });

            if (fanProfile?.isLocked) {
                redirect('/account-suspended');
            }
        }
    }

    const themeStyle = themeStyles[creator.theme] || themeStyles["creator-pro"];

    return (
        <CustomSessionProvider session={session}>
            <div className={`min-h-screen ${themeStyle.bg}`}>
                {/* クリエイター情報をコンテキストとして渡す */}
                <div data-creator-id={creator.id} data-creator-handle={creator.handle} data-theme={creator.theme}>
                    {children}
                </div>
            </div>
        </CustomSessionProvider>
    );
}

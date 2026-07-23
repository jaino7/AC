import { Prisma, prisma } from "@creator/shared";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { brandThemeOverrideCSS, getThemeConfig, supportsThemeBackgroundImage } from "@/lib/theme-config";
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

function isDatabaseUnavailableError(error: unknown) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
        return true;
    }

    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P1001") {
        return true;
    }

    return error instanceof Error && error.message.includes("Can't reach database server");
}

function DatabaseUnavailable() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
            <div className="max-w-md rounded-lg border border-white/10 bg-white/5 p-6 shadow-2xl">
                <h1 className="text-xl font-semibold">Database unavailable</h1>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                    The local PostgreSQL server is not reachable at localhost:5432. Start the database and refresh this page.
                </p>
                <pre className="mt-4 overflow-x-auto rounded bg-black/40 p-3 text-xs text-slate-200">
                    docker compose up -d db
                </pre>
            </div>
        </div>
    );
}

interface HandleLayoutProps {
    children: React.ReactNode;
    params: { handle: string };
}

// メタデータを動的に生成
export async function generateMetadata({ params }: HandleLayoutProps): Promise<Metadata> {
    if (params.handle === "demo") {
        return {
            title: "CocoBa Demo Studio",
            description: "CocoBaのファン向けコンテンツ販売ページのデモです。",
        };
    }

    let creator;
    try {
        creator = await prisma.creatorProfile.findUnique({
            where: { handle: params.handle },
            select: { displayName: true, bio: true, faviconUrl: true }
        });
    } catch (error) {
        if (isDatabaseUnavailableError(error)) {
            return {
                title: "Database unavailable",
                description: "The local PostgreSQL server is not reachable.",
            };
        }

        throw error;
    }

    if (!creator) {
        return { title: "Not Found" };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const faviconHref = creator.faviconUrl
        ? `${apiUrl}${creator.faviconUrl}`
        : undefined;

    return {
        title: creator.displayName,
        description: creator.bio || `${creator.displayName}のファンサイト`,
        ...(faviconHref && {
            icons: { icon: faviconHref },
        }),
    };
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { unstable_noStore as noStore } from "next/cache";
import { headers } from "next/headers";

export default async function HandleLayout({ children, params }: HandleLayoutProps) {
    noStore(); // データのキャッシュを無効化
    const session = await getServerSession(authOptions);

    if (params.handle === "demo") {
        return (
            <CustomSessionProvider session={session}>
                {children}
            </CustomSessionProvider>
        );
    }

    const headersList = headers();
    const host = headersList.get("host");
    const customDomainHeader = headersList.get("x-custom-domain");
    // x-pathnameから実際のパスを取得。無い場合は /handle をデフォルトにする
    const pathname = headersList.get("x-pathname") ?? `/${params.handle}`;
    // デバッグログ削除

    // クリエイターを取得
    let creator;
    try {
        creator = await prisma.creatorProfile.findUnique({
            where: { handle: params.handle },
            select: {
                id: true,
                handle: true,
                displayName: true,
                theme: true,
                themeConfig: true,
                logoUrl: true,
                faviconUrl: true,
                domains: {
                    where: { status: "ACTIVE" },
                    select: { domain: true },
                    take: 1
                }
            }
        });
    } catch (error) {
        if (isDatabaseUnavailableError(error)) {
            return <DatabaseUnavailable />;
        }

        throw error;
    }

    // クリエイターが見つからない場合は404
    if (!creator) {
        notFound();
    }

    // --- カスタムドメインへのリダイレクト判定 ---
    if (creator.domains && creator.domains.length > 0) {
        const customDomain = creator.domains[0].domain;
        
        // アクセス元のホスト名がカスタムドメインと異なり、かつカスタムドメイン経由のプロキシ（x-custom-domain）でもない場合
        // （つまりメインドメインからのアクセスである場合）
        if (host !== customDomain && customDomainHeader !== customDomain) {
            // パスから /handle の部分を取り除く（/handle/content -> / など）
            let newPath = pathname;
            if (newPath.startsWith(`/${params.handle}`)) {
                newPath = newPath.replace(`/${params.handle}`, "");
            }
            // /content はルートへのリダイレクトとする
            if (newPath === "/content" || newPath === "") {
                newPath = "/";
            }
            
            // FIXME: local testing environment variables could be used for protocol
            const protocol = host?.includes("localhost") || host?.includes("127.0.0.1") ? "http" : "https";
            redirect(`${protocol}://${customDomain}${newPath}`);
        }
    }
    // ---------------------------------------------

    // Check if fan account is locked / create FanProfile for new OAuth users
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
    const brandThemeConfig = getThemeConfig(creator.theme, creator.themeConfig as any);
    const brandCSS = brandThemeOverrideCSS(brandThemeConfig, {
        enableBackgroundImage: supportsThemeBackgroundImage(creator.theme),
    });

    return (
        <CustomSessionProvider session={session}>
            <style dangerouslySetInnerHTML={{ __html: brandCSS }} />
            <div className={`min-h-screen ${themeStyle.bg}`} data-brand-theme>
                {/* クリエイター情報をコンテキストとして渡す */}
                <div data-creator-id={creator.id} data-creator-handle={creator.handle} data-theme={creator.theme}>
                    {children}
                </div>
            </div>
        </CustomSessionProvider>
    );
}

"use client";

import { usePathname } from "next/navigation";
import { CreatorSidebar } from "./creator-sidebar";
import { CreatorHeader } from "./creator-header";
import { CreatorBottomNav } from "./creator-bottom-nav";
import { cn } from "@/lib/utils";

interface CreatorLayoutProps {
    children: React.ReactNode;
}

export function CreatorLayout({ children }: CreatorLayoutProps) {
    const pathname = usePathname();

    const isAuthPage =
        pathname?.startsWith("/creators/signup") ||
        pathname?.startsWith("/creators/login") ||
        pathname?.startsWith("/creators/password-reset") ||
        pathname?.startsWith("/creators/verify-email");

    if (isAuthPage) {
        return <div className="min-h-screen bg-white">{children}</div>;
    }

    return (
        <div className="min-h-screen bg-white">
            {/* ヘッダー */}
            <CreatorHeader />

            {/* サイドバー - デスクトップのみ */}
            <div className="hidden lg:block">
                <CreatorSidebar />
            </div>

            {/* メインコンテンツ */}
            {/* モバイル: pt-0（ヘッダー非固定）・pb-16（ボトムナビ分） */}
            {/* デスクトップ: pt-16（固定ヘッダー分）・pl-60（サイドバー分）・pb-0 */}
            <main className={cn("min-h-screen pb-16 lg:pb-0 lg:pt-16 lg:pl-60")}>
                <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">{children}</div>
            </main>

            {/* ボトムナビ - モバイルのみ */}
            <CreatorBottomNav />
        </div>
    );
}

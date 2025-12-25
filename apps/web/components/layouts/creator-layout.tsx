"use client";

import { useState } from "react";
import { CreatorSidebar } from "./creator-sidebar";
import { CreatorHeader } from "./creator-header";
import { cn } from "@/lib/utils";

interface CreatorLayoutProps {
    children: React.ReactNode;
}

export function CreatorLayout({ children }: CreatorLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* ヘッダー */}
            <CreatorHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* サイドバー - デスクトップ */}
            <div className="hidden lg:block">
                <CreatorSidebar />
            </div>

            {/* サイドバー - モバイル */}
            {isSidebarOpen && (
                <>
                    {/* オーバーレイ */}
                    <div
                        className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    {/* サイドバー */}
                    <div className="lg:hidden">
                        <CreatorSidebar />
                    </div>
                </>
            )}

            {/* メインコンテンツ */}
            <main
                className={cn(
                    "min-h-screen pt-16 transition-all",
                    "lg:pl-60" // デスクトップではサイドバー分の左パディング
                )}
            >
                <div className="mx-auto max-w-7xl p-6">{children}</div>
            </main>
        </div>
    );
}

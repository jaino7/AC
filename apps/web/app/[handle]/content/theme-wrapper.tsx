"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

interface ThemeContentWrapperProps {
    handle: string;
    initialTheme: string; // サーバーからの初期値
}

// テーマごとのコンテンツページコンポーネントを動的インポート
const NeonProContent = dynamic(() => import("@/app/neon-pro/content/page"));
const PureLiteContent = dynamic(() => import("@/app/pure-lite/content/page"));
const ZineLiteContent = dynamic(() => import("@/app/zine-lite/content/page"));
const CreatorProContent = dynamic(() => import("@/app/creator-pro/content/page"));
const VelvetProContent = dynamic(() => import("@/app/velvet-pro/content/page"));
const StudioProContent = dynamic(() => import("@/app/studio-pro/content/page"));

export function ThemeContentWrapper({ handle, initialTheme }: ThemeContentWrapperProps) {
    const [theme, setTheme] = useState(initialTheme);
    const [isLoading, setIsLoading] = useState(true);

    // クライアントサイドで最新のテーマを取得
    useEffect(() => {
        const fetchTheme = async () => {
            try {
                const res = await fetch(`/api/creators/${handle}/theme`, {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache',
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.theme && data.theme !== theme) {
                        console.log(`[ThemeWrapper] Theme updated: ${theme} -> ${data.theme}`);
                        setTheme(data.theme);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch theme:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTheme();
    }, [handle, theme]);

    // テーマに応じたコンテンツページコンポーネントをレンダリング
    // テーマページ側でusePathname()からハンドルを取得してクリエイターの実データを表示する
    const renderContent = () => {
        switch (theme) {
            case "neon-pro":
                return <NeonProContent key={theme} />;
            case "pure-lite":
                return <PureLiteContent key={theme} />;
            case "zine-lite":
                return <ZineLiteContent key={theme} />;
            case "creator-pro":
                return <CreatorProContent key={theme} />;
            case "velvet-pro":
                return <VelvetProContent key={theme} />;
            case "studio-pro":
                return <StudioProContent key={theme} />;
            default:
                return <CreatorProContent key={theme} />;
        }
    };

    return renderContent();
}

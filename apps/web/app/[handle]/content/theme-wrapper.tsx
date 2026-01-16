"use client";

import dynamic from "next/dynamic";

interface ThemeContentWrapperProps {
    handle: string;
    theme: string;
}

// テーマごとのコンテンツページコンポーネントを動的インポート
const NeonProContent = dynamic(() => import("@/app/neon-pro/content/page"));
const PureLiteContent = dynamic(() => import("@/app/pure-lite/content/page"));
const ZineLiteContent = dynamic(() => import("@/app/zine-lite/content/page"));
const CreatorProContent = dynamic(() => import("@/app/creator-pro/content/page"));
const VelvetProContent = dynamic(() => import("@/app/velvet-pro/content/page"));
const StudioProContent = dynamic(() => import("@/app/studio-pro/content/page"));

export function ThemeContentWrapper({ handle, theme }: ThemeContentWrapperProps) {
    // handleをグローバルに設定してテーマコンポーネントがuseSearchParamsで取得できるようにする
    // URLにhandleを追加
    if (typeof window !== "undefined" && !window.location.search.includes("handle=")) {
        const url = new URL(window.location.href);
        url.searchParams.set("handle", handle);
        window.history.replaceState({}, "", url.toString());
    }

    // テーマに応じたコンテンツページコンポーネントをレンダリング
    switch (theme) {
        case "neon-pro":
            return <NeonProContent />;
        case "pure-lite":
            return <PureLiteContent />;
        case "zine-lite":
            return <ZineLiteContent />;
        case "creator-pro":
            return <CreatorProContent />;
        case "velvet-pro":
            return <VelvetProContent />;
        case "studio-pro":
            return <StudioProContent />;
        default:
            return <CreatorProContent />;
    }
}


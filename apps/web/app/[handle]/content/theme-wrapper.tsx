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
    // テーマに応じたコンテンツページコンポーネントをレンダリング（handleをpropsで渡す）
    switch (theme) {
        case "neon-pro":
            return <NeonProContent handle={handle} />;
        case "pure-lite":
            return <PureLiteContent handle={handle} />;
        case "zine-lite":
            return <ZineLiteContent handle={handle} />;
        case "creator-pro":
            return <CreatorProContent handle={handle} />;
        case "velvet-pro":
            return <VelvetProContent handle={handle} />;
        case "studio-pro":
            return <StudioProContent handle={handle} />;
        default:
            return <CreatorProContent handle={handle} />;
    }
}

"use client";

import dynamic from "next/dynamic";

interface ThemeAccountWrapperProps {
    handle: string;
    theme: string;
    displayName: string;
    logoUrl: string | null;
}

// テーマごとのアカウントページコンポーネントを動的インポート
const NeonProAccount = dynamic(() => import("@/app/neon-pro/account/page"));
const PureLiteAccount = dynamic(() => import("@/app/pure-lite/account/page"));
const ZineLiteAccount = dynamic(() => import("@/app/zine-lite/account/page"));
const CreatorProAccount = dynamic(() => import("@/app/creator-pro/account/page"));
const VelvetProAccount = dynamic(() => import("@/app/velvet-pro/account/page"));
const StudioProAccount = dynamic(() => import("@/app/studio-pro/account/page"));

export function ThemeAccountWrapper({ handle, theme, displayName, logoUrl }: ThemeAccountWrapperProps) {
    // テーマに応じたアカウントページをレンダリング
    switch (theme) {
        case "neon-pro":
            return <NeonProAccount />;
        case "pure-lite":
            return <PureLiteAccount />;
        case "zine-lite":
            return <ZineLiteAccount />;
        case "creator-pro":
            return <CreatorProAccount />;
        case "velvet-pro":
            return <VelvetProAccount />;
        case "studio-pro":
            return <StudioProAccount />;
        default:
            return <CreatorProAccount />;
    }
}

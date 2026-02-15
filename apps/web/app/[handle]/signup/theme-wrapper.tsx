"use client";

import dynamic from "next/dynamic";

interface ThemeSignupWrapperProps {
    handle: string;
    theme: string;
    displayName: string;
    logoUrl: string | null;
}

// テーマごとのサインアップページコンポーネントを動的インポート
const NeonProSignup = dynamic(() => import("@/app/neon-pro/signup/page"));
const PureLiteSignup = dynamic(() => import("@/app/pure-lite/signup/page"));
const ZineLiteSignup = dynamic(() => import("@/app/zine-lite/signup/page"));
const CreatorProSignup = dynamic(() => import("@/app/creator-pro/signup/page"));
const VelvetProSignup = dynamic(() => import("@/app/velvet-pro/signup/page"));
const StudioProSignup = dynamic(() => import("@/app/studio-pro/signup/page"));

export function ThemeSignupWrapper({ handle, theme, displayName, logoUrl }: ThemeSignupWrapperProps) {
    // テーマに応じたサインアップページコンポーネントをレンダリング
    switch (theme) {
        case "neon-pro":
            return <NeonProSignup />;
        case "pure-lite":
            return <PureLiteSignup />;
        case "zine-lite":
            return <ZineLiteSignup />;
        case "creator-pro":
            return <CreatorProSignup />;
        case "velvet-pro":
            return <VelvetProSignup />;
        case "studio-pro":
            return <StudioProSignup />;
        default:
            return <CreatorProSignup />;
    }
}

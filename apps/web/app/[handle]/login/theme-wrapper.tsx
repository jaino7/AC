"use client";

import dynamic from "next/dynamic";

interface ThemeLoginWrapperProps {
    handle: string;
    theme: string;
    displayName: string;
    logoUrl: string | null;
}

// テーマごとのログインページコンポーネントを動的インポート
const NeonProLogin = dynamic(() => import("@/app/neon-pro/login/page"));
const PureLiteLogin = dynamic(() => import("@/app/pure-lite/login/page"));
const ZineLiteLogin = dynamic(() => import("@/app/zine-lite/login/page"));
const CreatorProLogin = dynamic(() => import("@/app/creator-pro/login/page"));
const VelvetProLogin = dynamic(() => import("@/app/velvet-pro/login/page"));
const StudioProLogin = dynamic(() => import("@/app/studio-pro/login/page"));

export function ThemeLoginWrapper({ handle, theme, displayName, logoUrl }: ThemeLoginWrapperProps) {
    const props = { handle, displayName, logoUrl };

    // テーマに応じたログインページコンポーネントをレンダリング
    switch (theme) {
        case "neon-pro":
            return <NeonProLogin {...props} />;
        case "pure-lite":
            return <PureLiteLogin {...props} />;
        case "zine-lite":
            return <ZineLiteLogin {...props} />;
        case "creator-pro":
            return <CreatorProLogin {...props} />;
        case "velvet-pro":
            return <VelvetProLogin {...props} />;
        case "studio-pro":
            return <StudioProLogin {...props} />;
        default:
            return <CreatorProLogin {...props} />;
    }
}

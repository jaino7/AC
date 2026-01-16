"use client";

import dynamic from "next/dynamic";

interface ThemeCreditsWrapperProps {
    handle: string;
    theme: string;
    displayName: string;
    logoUrl: string | null;
}

const NeonProCredits = dynamic(() => import("@/app/neon-pro/account/credits/page"));
const PureLiteCredits = dynamic(() => import("@/app/pure-lite/account/credits/page"));
const ZineLiteCredits = dynamic(() => import("@/app/zine-lite/account/credits/page"));
const CreatorProCredits = dynamic(() => import("@/app/creator-pro/account/credits/page"));
const VelvetProCredits = dynamic(() => import("@/app/velvet-pro/account/credits/page"));
const StudioProCredits = dynamic(() => import("@/app/studio-pro/account/credits/page"));

export function ThemeCreditsWrapper({ handle, theme, displayName, logoUrl }: ThemeCreditsWrapperProps) {
    const props = { handle, displayName, logoUrl };

    switch (theme) {
        case "neon-pro":
            return <NeonProCredits {...props} />;
        case "pure-lite":
            return <PureLiteCredits {...props} />;
        case "zine-lite":
            return <ZineLiteCredits {...props} />;
        case "creator-pro":
            return <CreatorProCredits {...props} />;
        case "velvet-pro":
            return <VelvetProCredits {...props} />;
        case "studio-pro":
            return <StudioProCredits {...props} />;
        default:
            return <CreatorProCredits {...props} />;
    }
}

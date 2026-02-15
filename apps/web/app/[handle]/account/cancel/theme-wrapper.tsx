"use client";

import dynamic from "next/dynamic";

interface ThemeCancelWrapperProps {
    handle: string;
    theme: string;
    displayName: string;
    logoUrl: string | null;
}

const NeonProCancel = dynamic(() => import("@/app/neon-pro/account/cancel/page"));
const PureLiteCancel = dynamic(() => import("@/app/pure-lite/account/cancel/page"));
const ZineLiteCancel = dynamic(() => import("@/app/zine-lite/account/cancel/page"));
const CreatorProCancel = dynamic(() => import("@/app/creator-pro/account/cancel/page"));
const VelvetProCancel = dynamic(() => import("@/app/velvet-pro/account/cancel/page"));
const StudioProCancel = dynamic(() => import("@/app/studio-pro/account/cancel/page"));

export function ThemeCancelWrapper({ handle, theme, displayName, logoUrl }: ThemeCancelWrapperProps) {
    switch (theme) {
        case "neon-pro":
            return <NeonProCancel />;
        case "pure-lite":
            return <PureLiteCancel />;
        case "zine-lite":
            return <ZineLiteCancel />;
        case "creator-pro":
            return <CreatorProCancel />;
        case "velvet-pro":
            return <VelvetProCancel />;
        case "studio-pro":
            return <StudioProCancel />;
        default:
            return <CreatorProCancel />;
    }
}

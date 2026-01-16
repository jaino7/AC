"use client";

import dynamic from "next/dynamic";

interface ThemeChangePlanWrapperProps {
    handle: string;
    theme: string;
    displayName: string;
    logoUrl: string | null;
}

const NeonProChangePlan = dynamic(() => import("@/app/neon-pro/account/change-plan/page"));
const PureLiteChangePlan = dynamic(() => import("@/app/pure-lite/account/change-plan/page"));
const ZineLiteChangePlan = dynamic(() => import("@/app/zine-lite/account/change-plan/page"));
const CreatorProChangePlan = dynamic(() => import("@/app/creator-pro/account/change-plan/page"));
const VelvetProChangePlan = dynamic(() => import("@/app/velvet-pro/account/change-plan/page"));
const StudioProChangePlan = dynamic(() => import("@/app/studio-pro/account/change-plan/page"));

export function ThemeChangePlanWrapper({ handle, theme, displayName, logoUrl }: ThemeChangePlanWrapperProps) {
    const props = { handle, displayName, logoUrl };

    switch (theme) {
        case "neon-pro":
            return <NeonProChangePlan {...props} />;
        case "pure-lite":
            return <PureLiteChangePlan {...props} />;
        case "zine-lite":
            return <ZineLiteChangePlan {...props} />;
        case "creator-pro":
            return <CreatorProChangePlan {...props} />;
        case "velvet-pro":
            return <VelvetProChangePlan {...props} />;
        case "studio-pro":
            return <StudioProChangePlan {...props} />;
        default:
            return <CreatorProChangePlan {...props} />;
    }
}

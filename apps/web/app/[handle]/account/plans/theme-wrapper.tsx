"use client";

import dynamic from "next/dynamic";

interface ThemePlansWrapperProps {
    handle: string;
    theme: string;
    displayName: string;
    logoUrl: string | null;
}

const NeonProPlans = dynamic(() => import("@/app/neon-pro/account/plans/page"));
const PureLitePlans = dynamic(() => import("@/app/pure-lite/account/plans/page"));
const ZineLitePlans = dynamic(() => import("@/app/zine-lite/account/plans/page"));
const CreatorProPlans = dynamic(() => import("@/app/creator-pro/account/plans/page"));
const VelvetProPlans = dynamic(() => import("@/app/velvet-pro/account/plans/page"));
const StudioProPlans = dynamic(() => import("@/app/studio-pro/account/plans/page"));

export function ThemePlansWrapper({ handle, theme, displayName, logoUrl }: ThemePlansWrapperProps) {
    const props = { handle, displayName, logoUrl };

    switch (theme) {
        case "neon-pro":
            return <NeonProPlans {...props} />;
        case "pure-lite":
            return <PureLitePlans {...props} />;
        case "zine-lite":
            return <ZineLitePlans {...props} />;
        case "creator-pro":
            return <CreatorProPlans {...props} />;
        case "velvet-pro":
            return <VelvetProPlans {...props} />;
        case "studio-pro":
            return <StudioProPlans {...props} />;
        default:
            return <CreatorProPlans {...props} />;
    }
}

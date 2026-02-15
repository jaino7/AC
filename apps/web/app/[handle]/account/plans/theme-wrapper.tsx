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
    switch (theme) {
        case "neon-pro":
            return <NeonProPlans />;
        case "pure-lite":
            return <PureLitePlans />;
        case "zine-lite":
            return <ZineLitePlans />;
        case "creator-pro":
            return <CreatorProPlans />;
        case "velvet-pro":
            return <VelvetProPlans />;
        case "studio-pro":
            return <StudioProPlans />;
        default:
            return <CreatorProPlans />;
    }
}

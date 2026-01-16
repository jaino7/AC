"use client";

import dynamic from "next/dynamic";

interface ThemeBillingWrapperProps {
    handle: string;
    theme: string;
    displayName: string;
    logoUrl: string | null;
}

const NeonProBilling = dynamic(() => import("@/app/neon-pro/account/billing/page"));
const PureLiteBilling = dynamic(() => import("@/app/pure-lite/account/billing/page"));
const ZineLiteBilling = dynamic(() => import("@/app/zine-lite/account/billing/page"));
const CreatorProBilling = dynamic(() => import("@/app/creator-pro/account/billing/page"));
const VelvetProBilling = dynamic(() => import("@/app/velvet-pro/account/billing/page"));
const StudioProBilling = dynamic(() => import("@/app/studio-pro/account/billing/page"));

export function ThemeBillingWrapper({ handle, theme, displayName, logoUrl }: ThemeBillingWrapperProps) {
    const props = { handle, displayName, logoUrl };

    switch (theme) {
        case "neon-pro":
            return <NeonProBilling {...props} />;
        case "pure-lite":
            return <PureLiteBilling {...props} />;
        case "zine-lite":
            return <ZineLiteBilling {...props} />;
        case "creator-pro":
            return <CreatorProBilling {...props} />;
        case "velvet-pro":
            return <VelvetProBilling {...props} />;
        case "studio-pro":
            return <StudioProBilling {...props} />;
        default:
            return <CreatorProBilling {...props} />;
    }
}

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
    switch (theme) {
        case "neon-pro":
            return <NeonProBilling />;
        case "pure-lite":
            return <PureLiteBilling />;
        case "zine-lite":
            return <ZineLiteBilling />;
        case "creator-pro":
            return <CreatorProBilling />;
        case "velvet-pro":
            return <VelvetProBilling />;
        case "studio-pro":
            return <StudioProBilling />;
        default:
            return <CreatorProBilling />;
    }
}

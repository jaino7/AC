"use client";

import dynamic from "next/dynamic";

interface ThemeSecurityWrapperProps {
    handle: string;
    theme: string;
    displayName: string;
    logoUrl: string | null;
}

const NeonProSecurity = dynamic(() => import("@/app/neon-pro/account/security/page"));
const PureLiteSecurity = dynamic(() => import("@/app/pure-lite/account/security/page"));
const ZineLiteSecurity = dynamic(() => import("@/app/zine-lite/account/security/page"));
const CreatorProSecurity = dynamic(() => import("@/app/creator-pro/account/security/page"));
const VelvetProSecurity = dynamic(() => import("@/app/velvet-pro/account/security/page"));
const StudioProSecurity = dynamic(() => import("@/app/studio-pro/account/security/page"));

export function ThemeSecurityWrapper({ handle, theme, displayName, logoUrl }: ThemeSecurityWrapperProps) {
    const props = { handle, displayName, logoUrl };

    switch (theme) {
        case "neon-pro":
            return <NeonProSecurity {...props} />;
        case "pure-lite":
            return <PureLiteSecurity {...props} />;
        case "zine-lite":
            return <ZineLiteSecurity {...props} />;
        case "creator-pro":
            return <CreatorProSecurity {...props} />;
        case "velvet-pro":
            return <VelvetProSecurity {...props} />;
        case "studio-pro":
            return <StudioProSecurity {...props} />;
        default:
            return <CreatorProSecurity {...props} />;
    }
}

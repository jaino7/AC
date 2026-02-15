"use client";

import dynamic from "next/dynamic";

interface ThemeNotificationsWrapperProps {
    handle: string;
    theme: string;
    displayName: string;
    logoUrl: string | null;
}

const NeonProNotifications = dynamic(() => import("@/app/neon-pro/account/notifications/page"));
const PureLiteNotifications = dynamic(() => import("@/app/pure-lite/account/notifications/page"));
const ZineLiteNotifications = dynamic(() => import("@/app/zine-lite/account/notifications/page"));
const CreatorProNotifications = dynamic(() => import("@/app/creator-pro/account/notifications/page"));
const VelvetProNotifications = dynamic(() => import("@/app/velvet-pro/account/notifications/page"));
const StudioProNotifications = dynamic(() => import("@/app/studio-pro/account/notifications/page"));

export function ThemeNotificationsWrapper({ handle, theme, displayName, logoUrl }: ThemeNotificationsWrapperProps) {
    switch (theme) {
        case "neon-pro":
            return <NeonProNotifications />;
        case "pure-lite":
            return <PureLiteNotifications />;
        case "zine-lite":
            return <ZineLiteNotifications />;
        case "creator-pro":
            return <CreatorProNotifications />;
        case "velvet-pro":
            return <VelvetProNotifications />;
        case "studio-pro":
            return <StudioProNotifications />;
        default:
            return <CreatorProNotifications />;
    }
}

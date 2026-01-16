"use client";

import { SimpleAccountNotificationsPage } from "@/components/account/simple-account-page";
import { useSearchParams } from "next/navigation";

interface StudioProNotificationsPageProps {
    handle?: string;
    displayName?: string;
    logoUrl?: string | null;
}

export default function StudioProNotificationsPage({ handle: propHandle, displayName, logoUrl }: StudioProNotificationsPageProps = {}) {
    const searchParams = useSearchParams();
    const handle = propHandle || searchParams.get("handle") || undefined;

    return (
        <SimpleAccountNotificationsPage
            handle={handle}
            displayName={displayName || "ユーザー"}
            logoUrl={logoUrl}
        />
    );
}

"use client";

import { SimpleAccountNotificationsPage } from "@/components/account/simple-account-page";
import { useSearchParams } from "next/navigation";

interface PureLiteNotificationsPageProps {
    handle?: string;
    displayName?: string;
    logoUrl?: string | null;
}

export default function PureLiteNotificationsPage({ handle: propHandle, displayName, logoUrl }: PureLiteNotificationsPageProps = {}) {
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

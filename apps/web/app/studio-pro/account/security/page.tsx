"use client";

import { SimpleAccountSecurityPage } from "@/components/account/simple-account-page";
import { useSearchParams } from "next/navigation";

interface StudioProSecurityPageProps {
    handle?: string;
    displayName?: string;
    logoUrl?: string | null;
}

export default function StudioProSecurityPage({ handle: propHandle, displayName, logoUrl }: StudioProSecurityPageProps = {}) {
    const searchParams = useSearchParams();
    const handle = propHandle || searchParams.get("handle") || undefined;

    return (
        <SimpleAccountSecurityPage
            handle={handle}
            displayName={displayName || "ユーザー"}
            logoUrl={logoUrl}
        />
    );
}

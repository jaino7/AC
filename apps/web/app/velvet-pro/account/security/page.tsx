"use client";

import { SimpleAccountSecurityPage } from "@/components/account/simple-account-page";
import { useSearchParams } from "next/navigation";

interface VelvetProSecurityPageProps {
    handle?: string;
    displayName?: string;
    logoUrl?: string | null;
}

export default function VelvetProSecurityPage({ handle: propHandle, displayName, logoUrl }: VelvetProSecurityPageProps = {}) {
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

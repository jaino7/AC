"use client";

import { SimpleAccountSecurityPage } from "@/components/account/simple-account-page";
import { useSearchParams } from "next/navigation";

export default function CreatorProSecurityPage() {
    const searchParams = useSearchParams();
    const handle = searchParams.get("handle") || undefined;

    return (
        <SimpleAccountSecurityPage
            handle={handle}
            displayName="ユーザー"
            logoUrl={null}
        />
    );
}

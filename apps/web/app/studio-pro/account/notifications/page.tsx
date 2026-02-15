"use client";

import { SimpleAccountNotificationsPage } from "@/components/account/simple-account-page";
import { useSearchParams } from "next/navigation";

export default function StudioProNotificationsPage() {
    const searchParams = useSearchParams();
    const handle = searchParams.get("handle") || undefined;

    return (
        <SimpleAccountNotificationsPage
            handle={handle}
            displayName="ユーザー"
            logoUrl={null}
        />
    );
}

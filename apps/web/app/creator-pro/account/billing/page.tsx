"use client";

import { SimpleAccountBillingPage } from "@/components/account/simple-account-page";
import { useSearchParams } from "next/navigation";

interface CreatorProBillingPageProps {
  handle?: string;
  displayName?: string;
  logoUrl?: string | null;
}

export default function CreatorProBillingPage({ handle: propHandle, displayName, logoUrl }: CreatorProBillingPageProps = {}) {
  const searchParams = useSearchParams();
  const handle = propHandle || searchParams.get("handle") || undefined;

  return (
    <SimpleAccountBillingPage
      handle={handle}
      displayName={displayName || "ユーザー"}
      logoUrl={logoUrl}
    />
  );
}

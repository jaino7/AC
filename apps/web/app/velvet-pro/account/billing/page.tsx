"use client";

import { SimpleAccountBillingPage } from "@/components/account/simple-account-page";
import { useSearchParams } from "next/navigation";

interface VelvetProBillingPageProps {
  handle?: string;
  displayName?: string;
  logoUrl?: string | null;
}

export default function VelvetProBillingPage({ handle: propHandle, displayName, logoUrl }: VelvetProBillingPageProps = {}) {
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

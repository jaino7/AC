"use client";

import { SimpleAccountPage } from "@/components/account/simple-account-page";
import { useSearchParams } from "next/navigation";

interface PureLiteAccountPageProps {
  handle?: string;
  displayName?: string;
  logoUrl?: string | null;
}

export default function PureLiteAccountPage({ handle: propHandle, displayName, logoUrl }: PureLiteAccountPageProps = {}) {
  const searchParams = useSearchParams();
  const handle = propHandle || searchParams.get("handle") || undefined;

  return (
    <SimpleAccountPage
      handle={handle}
      displayName={displayName || "ユーザー"}
      logoUrl={logoUrl}
      currentPage="account"
    />
  );
}

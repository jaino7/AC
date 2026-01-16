"use client";

import { SimpleAccountPage } from "@/components/account/simple-account-page";
import { useSearchParams } from "next/navigation";

interface ZineLiteAccountPageProps {
  handle?: string;
  displayName?: string;
  logoUrl?: string | null;
}

export default function ZineLiteAccountPage({ handle: propHandle, displayName, logoUrl }: ZineLiteAccountPageProps = {}) {
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

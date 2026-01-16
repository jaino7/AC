"use client";

import { SimpleAccountPage } from "@/components/account/simple-account-page";
import { useSearchParams } from "next/navigation";

interface NeonProAccountPageProps {
  handle?: string;
  displayName?: string;
  logoUrl?: string | null;
}

export default function NeonProAccountPage({ handle: propHandle, displayName, logoUrl }: NeonProAccountPageProps = {}) {
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

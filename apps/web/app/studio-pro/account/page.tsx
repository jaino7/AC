"use client";

import { SimpleAccountPage } from "@/components/account/simple-account-page";
import { useSearchParams } from "next/navigation";

interface StudioProAccountPageProps {
  handle?: string;
  displayName?: string;
  logoUrl?: string | null;
}

export default function StudioProAccountPage({ handle: propHandle, displayName, logoUrl }: StudioProAccountPageProps = {}) {
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

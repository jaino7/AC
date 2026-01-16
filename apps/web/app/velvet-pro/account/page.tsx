"use client";

import { SimpleAccountPage } from "@/components/account/simple-account-page";
import { useSearchParams } from "next/navigation";

interface VelvetProAccountPageProps {
  handle?: string;
  displayName?: string;
  logoUrl?: string | null;
}

export default function VelvetProAccountPage({ handle: propHandle, displayName, logoUrl }: VelvetProAccountPageProps = {}) {
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

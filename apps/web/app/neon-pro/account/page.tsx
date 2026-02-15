"use client";

import { SimpleAccountPage } from "@/components/account/simple-account-page";
import { useSearchParams } from "next/navigation";

export default function NeonProAccountPage() {
  const searchParams = useSearchParams();
  const handle = searchParams.get("handle") || undefined;

  return (
    <SimpleAccountPage
      handle={handle}
      displayName="ユーザー"
      logoUrl={null}
      currentPage="account"
    />
  );
}

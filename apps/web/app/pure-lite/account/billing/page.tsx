"use client";

import { SimpleAccountBillingPage } from "@/components/account/simple-account-page";
import { useSearchParams } from "next/navigation";

export default function PureLiteBillingPage() {
  const searchParams = useSearchParams();
  const handle = searchParams.get("handle") || undefined;

  return (
    <SimpleAccountBillingPage
      handle={handle}
      displayName="ユーザー"
      logoUrl={null}
    />
  );
}

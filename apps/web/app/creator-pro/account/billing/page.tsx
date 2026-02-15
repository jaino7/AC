"use client";

import { Suspense } from "react";


import { SimpleAccountBillingPage } from "@/components/account/simple-account-page";
import { usePathname, useSearchParams } from "next/navigation";

function CreatorProBillingPageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const THEME_PREFIXES = ['creator-pro', 'neon-pro', 'studio-pro', 'velvet-pro', 'pure-lite', 'zine-lite'];
  const pathSegment = pathname.split('/')[1] || '';
  const handle = THEME_PREFIXES.includes(pathSegment)
    ? (searchParams.get("handle") || undefined)
    : (pathSegment || undefined);

  return (
    <SimpleAccountBillingPage
      handle={handle}
      displayName="ユーザー"
      logoUrl={null}
    />
  );
}

export default function CreatorProBillingPage() {
  return (
    <Suspense>
      <CreatorProBillingPageContent />
    </Suspense>
  );
}

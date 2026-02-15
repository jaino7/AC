"use client";

export const dynamic = 'force-dynamic';

import { SimpleAccountPage } from "@/components/account/simple-account-page";
import { usePathname, useSearchParams } from "next/navigation";

export default function CreatorProAccountPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const THEME_PREFIXES = ['creator-pro', 'neon-pro', 'studio-pro', 'velvet-pro', 'pure-lite', 'zine-lite'];
  const pathSegment = pathname.split('/')[1] || '';
  const handle = THEME_PREFIXES.includes(pathSegment)
    ? (searchParams.get("handle") || undefined)
    : (pathSegment || undefined);

  return (
    <SimpleAccountPage
      handle={handle}
      displayName="ユーザー"
      logoUrl={null}
      currentPage="account"
    />
  );
}

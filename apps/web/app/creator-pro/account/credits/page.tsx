import { Suspense } from "react";
import { SimpleAccountCreditsPage } from "@/components/account/simple-account-page";
import { usePathname, useSearchParams } from "next/navigation";

function CreatorProCreditsPageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const THEME_PREFIXES = ["creator-pro", "neon-pro", "studio-pro", "velvet-pro", "pure-lite", "zine-lite"];
  const pathSegment = pathname.split("/")[1] || "";
  const handle = THEME_PREFIXES.includes(pathSegment)
    ? (searchParams.get("handle") || undefined)
    : (pathSegment || undefined);

  return (
    <SimpleAccountCreditsPage
      handle={handle}
      logoUrl={null}
    />
  );
}

export default function CreatorProCreditsPage() {
  return (
    <Suspense>
      <CreatorProCreditsPageContent />
    </Suspense>
  );
}

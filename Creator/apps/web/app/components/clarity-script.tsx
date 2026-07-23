"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

const EXCLUDED_PATHS = ["/creators", "/admin"];

export function ClarityScript() {
  const pathname = usePathname();

  if (EXCLUDED_PATHS.some((path) => pathname.startsWith(path))) {
    return null;
  }

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "vr16a4wb0b");
        `,
      }}
    />
  );
}

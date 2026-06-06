type GoogleOAuthLoginOptions = {
  callbackUrl: string;
  domain?: string;
};

export function getOAuthRedirectOrigin(mainDomain: string) {
  const domain = mainDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");

  if (!domain && typeof window !== "undefined") {
    return window.location.origin;
  }

  if (process.env.NODE_ENV === "development" && domain.startsWith("lvh.me")) {
    const port = domain.split(":")[1] || "3000";
    return `http://localhost:${port}`;
  }

  const protocol = mainDomain.startsWith("https://")
    ? "https:"
    : typeof window !== "undefined"
      ? window.location.protocol
      : "http:";

  return `${protocol}//${domain}`;
}

export function startGoogleOAuthLogin({ callbackUrl, domain }: GoogleOAuthLoginOptions) {
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "";
  const redirectUrl = new URL("/auth/google-redirect", getOAuthRedirectOrigin(mainDomain));

  redirectUrl.searchParams.set("path", callbackUrl);

  if (domain) {
    redirectUrl.searchParams.set("domain", domain);
  }

  window.location.href = redirectUrl.toString();
}

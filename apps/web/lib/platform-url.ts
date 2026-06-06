const DEFAULT_PLATFORM_DOMAIN = "getcocoba.com";

export function getPlatformDomain(): string {
  const configured =
    process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ||
    process.env.NEXT_PUBLIC_MAIN_DOMAIN ||
    DEFAULT_PLATFORM_DOMAIN;

  const domain = configured
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .split(":")[0];

  if (!domain || domain === "localhost" || domain === "127.0.0.1") {
    return DEFAULT_PLATFORM_DOMAIN;
  }

  return domain;
}

export function getCreatorPlatformUrl(handle: string, path = "/content"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `https://${handle}.${getPlatformDomain()}${normalizedPath}`;
}

import NextAuth from "next-auth";
import { NextRequest } from "next/server";

import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

type NextAuthContext = {
  params: Promise<{ nextauth: string[] }> | { nextauth: string[] };
};

function addCallbackUrlFromOAuthState(request: NextRequest) {
  const url = new URL(request.url);
  const isGoogleCallback = url.pathname.endsWith("/api/auth/callback/google");
  const state = url.searchParams.get("state");

  if (!isGoogleCallback || !state || url.searchParams.has("callbackUrl")) {
    return request;
  }

  try {
    const callbackUrl = Buffer.from(state, "base64").toString("utf8");
    const parsedCallbackUrl = new URL(callbackUrl, url.origin);

    if (parsedCallbackUrl.origin !== url.origin) {
      return request;
    }

    url.searchParams.set("callbackUrl", parsedCallbackUrl.toString());
    url.searchParams.delete("state");
    return new NextRequest(url.toString(), request);
  } catch {
    return request;
  }
}

export function GET(request: NextRequest, context: NextAuthContext) {
  return handler(addCallbackUrlFromOAuthState(request), context);
}

export { handler as POST };

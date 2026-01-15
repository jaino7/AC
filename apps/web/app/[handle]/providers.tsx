"use client";

import { SessionProvider } from "next-auth/react";

export function HandleSessionProvider({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}

"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

export function CustomSessionProvider({
    children,
    session
}: {
    children: React.ReactNode,
    session?: Session | null
}) {
    // デバッグログ削除

    return <SessionProvider session={session}>{children}</SessionProvider>;
}

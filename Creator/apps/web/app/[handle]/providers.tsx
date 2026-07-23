"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { QueryProvider } from "@/components/providers/QueryProvider";

// sessionプロパティを明示的に受け取る
export function HandleSessionProvider({
    children,
    session
}: {
    children: React.ReactNode,
    session?: Session | null
}) {
    if (typeof window !== 'undefined') {
        // nullの場合でもログを出力（サーバーからnullが渡されている可能性を確認）
        console.log("PROVIDER SESSION DEBUG (Revised):", session);
    }

    // sessionがundefinedの場合は、SessionProviderが内部でfetchするが、
    // ここではサーバーから渡されたsession（nullまたはオブジェクト）を優先する
    return (
        <QueryProvider>
            <SessionProvider session={session}>{children}</SessionProvider>
        </QueryProvider>
    );
}

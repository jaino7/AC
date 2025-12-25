"use client";

import { SessionProvider } from "next-auth/react";
import { CreatorLayout } from "@/components/layouts/creator-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <CreatorLayout>{children}</CreatorLayout>
        </SessionProvider>
    );
}

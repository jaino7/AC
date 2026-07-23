import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ThemeNotificationsWrapper } from "./theme-wrapper";

interface NotificationsPageProps {
    params: { handle: string };
}

export default async function NotificationsPage({ params }: NotificationsPageProps) {
    const creator = await prisma.creatorProfile.findUnique({
        where: { handle: params.handle },
        select: {
            handle: true,
            theme: true,
            displayName: true,
            logoUrl: true
        }
    });

    if (!creator) {
        notFound();
    }

    return <ThemeNotificationsWrapper
        handle={creator.handle}
        theme={creator.theme}
        displayName={creator.displayName}
        logoUrl={creator.logoUrl}
    />;
}

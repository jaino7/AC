import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ThemeCreditsWrapper } from "./theme-wrapper";

interface CreditsPageProps {
    params: { handle: string };
}

export default async function CreditsPage({ params }: CreditsPageProps) {
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

    return <ThemeCreditsWrapper
        handle={creator.handle}
        theme={creator.theme}
        displayName={creator.displayName}
        logoUrl={creator.logoUrl}
    />;
}

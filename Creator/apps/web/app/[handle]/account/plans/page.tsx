import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ThemePlansWrapper } from "./theme-wrapper";

interface PlansPageProps {
    params: { handle: string };
}

export default async function PlansPage({ params }: PlansPageProps) {
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

    return <ThemePlansWrapper
        handle={creator.handle}
        theme={creator.theme}
        displayName={creator.displayName}
        logoUrl={creator.logoUrl}
    />;
}

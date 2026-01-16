import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ThemeChangePlanWrapper } from "./theme-wrapper";

interface ChangePlanPageProps {
    params: { handle: string };
}

export default async function ChangePlanPage({ params }: ChangePlanPageProps) {
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

    return <ThemeChangePlanWrapper
        handle={creator.handle}
        theme={creator.theme}
        displayName={creator.displayName}
        logoUrl={creator.logoUrl}
    />;
}

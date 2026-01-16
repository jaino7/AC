import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ThemeCancelWrapper } from "./theme-wrapper";

interface CancelPageProps {
    params: { handle: string };
}

export default async function CancelPage({ params }: CancelPageProps) {
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

    return <ThemeCancelWrapper
        handle={creator.handle}
        theme={creator.theme}
        displayName={creator.displayName}
        logoUrl={creator.logoUrl}
    />;
}

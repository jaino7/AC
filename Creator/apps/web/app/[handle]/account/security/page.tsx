import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ThemeSecurityWrapper } from "./theme-wrapper";

interface SecurityPageProps {
    params: { handle: string };
}

export default async function SecurityPage({ params }: SecurityPageProps) {
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

    return <ThemeSecurityWrapper
        handle={creator.handle}
        theme={creator.theme}
        displayName={creator.displayName}
        logoUrl={creator.logoUrl}
    />;
}

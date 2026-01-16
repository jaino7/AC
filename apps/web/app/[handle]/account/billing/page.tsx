import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ThemeBillingWrapper } from "./theme-wrapper";

interface BillingPageProps {
    params: { handle: string };
}

export default async function BillingPage({ params }: BillingPageProps) {
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

    return <ThemeBillingWrapper
        handle={creator.handle}
        theme={creator.theme}
        displayName={creator.displayName}
        logoUrl={creator.logoUrl}
    />;
}

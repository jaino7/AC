import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SignupForm } from "./signup-form";

interface SignupPageProps {
    params: { handle: string };
}

export default async function SignupPage({ params }: SignupPageProps) {
    // クリエイター情報を取得
    const creator = await prisma.creatorProfile.findUnique({
        where: { handle: params.handle },
        select: {
            id: true,
            handle: true,
            displayName: true,
            theme: true,
            logoUrl: true
        }
    });

    if (!creator) {
        notFound();
    }

    return (
        <SignupForm
            creatorHandle={creator.handle}
            creatorName={creator.displayName}
            theme={creator.theme}
            logoUrl={creator.logoUrl}
        />
    );
}

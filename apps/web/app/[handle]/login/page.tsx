import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { LoginForm } from "./login-form";

interface LoginPageProps {
    params: { handle: string };
}

export default async function LoginPage({ params }: LoginPageProps) {
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
        <LoginForm
            creatorHandle={creator.handle}
            creatorName={creator.displayName}
            theme={creator.theme}
            logoUrl={creator.logoUrl}
        />
    );
}

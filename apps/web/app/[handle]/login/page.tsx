import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

interface LoginPageProps {
    params: { handle: string };
}

export default async function LoginPage({ params }: LoginPageProps) {
    // クリエイター情報を取得
    const creator = await prisma.creatorProfile.findUnique({
        where: { handle: params.handle },
        select: {
            handle: true,
            theme: true
        }
    });

    if (!creator) {
        notFound();
    }

    // テーマ固有のloginページにリダイレクト
    redirect(`/${creator.theme}/login`);
}

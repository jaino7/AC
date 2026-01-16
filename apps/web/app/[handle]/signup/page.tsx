import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

interface SignupPageProps {
    params: { handle: string };
}

export default async function SignupPage({ params }: SignupPageProps) {
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

    // テーマページにリダイレクト（handleをクエリパラメータとして渡す）
    redirect(`/${creator.theme}/signup?handle=${creator.handle}`);
}

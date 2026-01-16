import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

interface ContentPageProps {
    params: { handle: string };
}

export default async function Page({ params }: ContentPageProps) {
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
    redirect(`/${creator.theme}/content?handle=${creator.handle}`);
}



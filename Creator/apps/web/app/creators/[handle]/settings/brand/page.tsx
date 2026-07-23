import BrandAssetsSettings from "@/components/BrandAssetsSettings";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function BrandSettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/creators/login");
    }

    const creator = await prisma.creatorProfile.findFirst({
        where: { user: { email: session.user.email } },
        select: {
            id: true,
            displayName: true,
            themeConfig: true,
            logoUrl: true,
            faviconUrl: true,
        },
    });

    if (!creator) {
        return <div>クリエイタープロフィールが見つかりません</div>;
    }

    return (
        <div className="mx-auto max-w-4xl px-6 py-10">
            <header className="mb-8">
                <h1 className="text-3xl font-semibold">ブランド基本設定</h1>
                <p className="mt-2 text-gray-600">
                    サイト名、ロゴ、ファビコンを設定してブランドを整えます。
                </p>
            </header>

            <BrandAssetsSettings
                creatorId={creator.id}
                initialDisplayName={creator.displayName}
                initialLogoUrl={creator.logoUrl}
                initialFaviconUrl={creator.faviconUrl}
                initialShowNameInHeader={(creator.themeConfig as any)?.showNameInHeader !== false}
                showAvatar={false}
            />
        </div>
    );
}

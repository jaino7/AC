import BrandAssetsSettings from "@/components/BrandAssetsSettings";
import { prisma } from "@creator/shared";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
            logoUrl: true,
            faviconUrl: true
        }
    });

    if (!creator) {
        return <div>クリエイタープロフィールが見つかりません</div>;
    }

    return (
        <div className="mx-auto max-w-4xl px-6 py-10">
            <header className="mb-8">
                <h1 className="text-3xl font-semibold">ブランドアセット設定</h1>
                <p className="mt-2 text-gray-600">
                    ロゴとファビコンを設定して、ブランドをカスタマイズしましょう
                </p>
            </header>

            <BrandAssetsSettings
                creatorId={creator.id}
                initialLogoUrl={creator.logoUrl}
                initialFaviconUrl={creator.faviconUrl}
            />
        </div>
    );
}

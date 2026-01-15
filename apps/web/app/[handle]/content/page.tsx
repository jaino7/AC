import { prisma } from "@creator/shared";
import { notFound } from "next/navigation";
import { ContentPage } from "./content-page";

interface ContentPageProps {
    params: { handle: string };
}

export default async function Page({ params }: ContentPageProps) {
    // クリエイター情報を取得
    const creator = await prisma.creatorProfile.findUnique({
        where: { handle: params.handle },
        select: {
            id: true,
            handle: true,
            displayName: true,
            bio: true,
            theme: true,
            logoUrl: true,
            twitterUrl: true,
            instagramUrl: true,
            tiktokUrl: true,
            discordUrl: true,
            otherUrl: true,
            plans: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true
                },
                orderBy: { price: "asc" }
            },
            posts: {
                where: {
                    status: "PUBLISHED",
                    visibility: "PUBLIC"
                },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    thumbnailUrl: true,
                    price: true,
                    createdAt: true,
                    requiredPlan: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
                take: 50
            }
        }
    });

    if (!creator) {
        notFound();
    }

    return (
        <ContentPage
            creator={{
                id: creator.id,
                handle: creator.handle,
                displayName: creator.displayName,
                bio: creator.bio,
                theme: creator.theme,
                logoUrl: creator.logoUrl,
                twitterUrl: creator.twitterUrl,
                instagramUrl: creator.instagramUrl,
                tiktokUrl: creator.tiktokUrl,
                discordUrl: creator.discordUrl,
                otherUrl: creator.otherUrl
            }}
            plans={creator.plans}
            posts={creator.posts.map(post => ({
                id: post.id,
                title: post.title,
                content: post.content,
                thumbnailUrl: post.thumbnailUrl,
                price: post.price,
                createdAt: post.createdAt.toISOString(),
                requiredPlan: post.requiredPlan
            }))}
        />
    );
}

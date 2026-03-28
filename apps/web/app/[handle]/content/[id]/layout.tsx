import { Metadata } from "next";
import { prisma } from "@creator/shared";

interface ContentLayoutProps {
    children: React.ReactNode;
    params: { handle: string; id: string };
}

export async function generateMetadata({ params }: ContentLayoutProps): Promise<Metadata> {
    const post = await prisma.post.findUnique({
        where: { id: params.id },
        select: {
            title: true,
            content: true,
            thumbnailUrl: true,
            creator: {
                select: {
                    displayName: true,
                    handle: true,
                },
            },
        },
    });

    if (!post) {
        return { title: "Not Found" };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const title = `${post.title} - ${post.creator.displayName}`;
    const description = post.content
        ? post.content.slice(0, 200)
        : `${post.creator.displayName}のコンテンツ`;
    const url = `${baseUrl}/${post.creator.handle}/content/${params.id}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url,
            type: "article",
            ...(post.thumbnailUrl && {
                images: [
                    {
                        url: post.thumbnailUrl,
                        width: 1200,
                        height: 630,
                        alt: post.title,
                    },
                ],
            }),
        },
        twitter: {
            card: post.thumbnailUrl ? "summary_large_image" : "summary",
            title,
            description,
            ...(post.thumbnailUrl && {
                images: [post.thumbnailUrl],
            }),
        },
    };
}

export default function ContentDetailLayout({ children }: ContentLayoutProps) {
    return <>{children}</>;
}

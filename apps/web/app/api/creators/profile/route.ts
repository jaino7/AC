import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// GET - Get creator profile
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const handle = searchParams.get("handle");

        let creatorProfile;

        if (handle) {
            // Public access by handle
            creatorProfile = await prisma.creatorProfile.findUnique({
                where: { handle },
                select: {
                    id: true,
                    handle: true,
                    displayName: true,
                    bio: true,
                    theme: true,
                    logoUrl: true,
                    faviconUrl: true,
                    twitterUrl: true,
                    instagramUrl: true,
                    tiktokUrl: true,
                    discordUrl: true,
                    otherUrl: true,
                },
            });
        } else {
            // Authenticated access (own profile)
            const session = await getServerSession(authOptions);
            if (!session?.user?.email) {
                return NextResponse.json({ error: "認証されていません" }, { status: 401 });
            }

            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                include: {
                    creatorProfile: {
                        select: {
                            id: true,
                            handle: true,
                            displayName: true,
                            bio: true,
                            theme: true,
                            logoUrl: true,
                            faviconUrl: true,
                            twitterUrl: true,
                            instagramUrl: true,
                            tiktokUrl: true,
                            discordUrl: true,
                            otherUrl: true,
                            creatorSubscription: {
                                select: {
                                    status: true,
                                    plan: {
                                        select: {
                                            type: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            creatorProfile = user?.creatorProfile;

            // Add plan access information
            if (creatorProfile) {
                const hasAccess =
                    creatorProfile.creatorSubscription?.status === "ACTIVE" &&
                    (creatorProfile.creatorSubscription.plan.type === "LITE" ||
                        creatorProfile.creatorSubscription.plan.type === "BUSINESS");

                (creatorProfile as any).hasAccess = hasAccess;
                (creatorProfile as any).type = creatorProfile.creatorSubscription?.plan.type;
            }
        }

        if (!creatorProfile) {
            return NextResponse.json(
                { error: "クリエイタープロフィールが見つかりません" },
                { status: 404 }
            );
        }

        return NextResponse.json({ profile: creatorProfile });
    } catch (error) {
        console.error("Error fetching creator profile:", error);
        return NextResponse.json(
            { error: "プロフィールの取得に失敗しました" },
            { status: 500 }
        );
    }
}

// PUT - Update creator profile
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "認証されていません" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                creatorProfile: true,
            },
        });

        if (!user?.creatorProfile) {
            console.error("Creator profile not found for user:", session.user.email);
            return NextResponse.json(
                { error: "クリエイタープロフィールが見つかりません" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { displayName, bio, twitterUrl, instagramUrl, tiktokUrl, discordUrl, otherUrl } = body;

        console.log("Updating profile for:", user.creatorProfile.id, "with data:", {
            displayName,
            bio: bio?.substring(0, 50),
            twitterUrl,
            instagramUrl,
            tiktokUrl,
            discordUrl,
            otherUrl
        });

        // Validate input
        if (displayName && displayName.trim().length < 1) {
            return NextResponse.json(
                { error: "表示名は必須です" },
                { status: 400 }
            );
        }

        // Update profile
        const updatedProfile = await prisma.creatorProfile.update({
            where: { id: user.creatorProfile.id },
            data: {
                ...(displayName !== undefined && { displayName: displayName.trim() }),
                ...(bio !== undefined && { bio: bio?.trim() || null }),
                ...(twitterUrl !== undefined && { twitterUrl: twitterUrl?.trim() || null }),
                ...(instagramUrl !== undefined && { instagramUrl: instagramUrl?.trim() || null }),
                ...(tiktokUrl !== undefined && { tiktokUrl: tiktokUrl?.trim() || null }),
                ...(discordUrl !== undefined && { discordUrl: discordUrl?.trim() || null }),
                ...(otherUrl !== undefined && { otherUrl: otherUrl?.trim() || null }),
            },
            select: {
                id: true,
                handle: true,
                displayName: true,
                bio: true,
                theme: true,
                logoUrl: true,
                faviconUrl: true,
                twitterUrl: true,
                instagramUrl: true,
                tiktokUrl: true,
                discordUrl: true,
                otherUrl: true,
            },
        });

        console.log("Profile updated successfully:", updatedProfile.id);
        return NextResponse.json({ profile: updatedProfile });
    } catch (error) {
        console.error("Error updating creator profile:", error);
        // より詳細なエラー情報を出力
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        return NextResponse.json(
            { error: "プロフィールの更新に失敗しました" },
            { status: 500 }
        );
    }
}

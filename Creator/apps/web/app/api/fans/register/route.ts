import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@creator/shared";
import { hash } from "argon2";
import { fanSignupSchema } from "@/lib/validators/fan-auth";
import { sendEmailSafe } from "@/lib/email/client";
import { WelcomeEmail } from "@/lib/email/templates/fan/WelcomeEmail";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const result = fanSignupSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.errors[0]?.message || "入力内容を確認してください" },
                { status: 400 }
            );
        }

        const { email, password, displayName } = result.data;
        const { creatorHandle } = body;

        // creatorHandleは必須
        if (!creatorHandle) {
            return NextResponse.json(
                { error: "クリエイターが指定されていません" },
                { status: 400 }
            );
        }

        // クリエイターを取得
        const creator = await prisma.creatorProfile.findUnique({
            where: { handle: creatorHandle }
        });

        if (!creator) {
            return NextResponse.json(
                { error: "指定されたクリエイターが見つかりません" },
                { status: 404 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            // ユーザーは存在するが、このクリエイターへの登録が未完了か確認
            const existingFanProfile = await prisma.fanProfile.findUnique({
                where: {
                    userId_creatorId: {
                        userId: existingUser.id,
                        creatorId: creator.id
                    }
                }
            });

            if (existingFanProfile) {
                return NextResponse.json(
                    { error: "このクリエイターには既に登録済みです" },
                    { status: 409 }
                );
            }

            // 既存ユーザーに新しいクリエイターのFanProfileを作成
            await prisma.fanProfile.create({
                data: {
                    userId: existingUser.id,
                    creatorId: creator.id,
                    displayName: displayName || email.split("@")[0],
                    credits: 0
                }
            });

            return NextResponse.json({
                success: true,
                message: "アカウントが作成されました",
                user: {
                    id: existingUser.id,
                    email: existingUser.email,
                    name: existingUser.name
                }
            });
        }

        // Hash password
        const hashedPassword = await hash(password);

        // Create user and fan profile in transaction
        const user = await prisma.$transaction(async (tx) => {
            // Create user
            const newUser = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: displayName || email.split("@")[0],
                    role: "USER" // Fans have USER role
                }
            });

            // Create fan profile for this creator
            await tx.fanProfile.create({
                data: {
                    userId: newUser.id,
                    creatorId: creator.id,
                    displayName: displayName || email.split("@")[0],
                    credits: 0
                }
            });

            return newUser;
        });

        const fanName = displayName || email.split("@")[0];
        sendEmailSafe({
            to: email,
            subject: `${creator.displayName}のファンコミュニティへようこそ！`,
            react: WelcomeEmail({ fanName, creatorName: creator.displayName, creatorHandle }),
            emailType: "FAN_EMAIL_VERIFICATION",
            recipientId: user.id,
        }).catch((err) => console.error("Failed to send welcome email:", err));

        return NextResponse.json({
            success: true,
            message: "アカウントが作成されました",
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error("Fan registration error:", error);
        return NextResponse.json(
            { error: "アカウントの作成に失敗しました" },
            { status: 500 }
        );
    }
}

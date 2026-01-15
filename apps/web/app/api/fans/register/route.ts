import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@creator/shared";
import { hash } from "argon2";
import { fanSignupSchema } from "@/lib/validators/fan-auth";

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

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "このメールアドレスは既に登録されています" },
                { status: 409 }
            );
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

            // Create fan profile
            await tx.fanProfile.create({
                data: {
                    userId: newUser.id,
                    displayName: displayName || email.split("@")[0],
                    credits: 0
                }
            });

            return newUser;
        });

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

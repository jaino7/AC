import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmailSafe } from "@/lib/email/client";
import { BankAccountRegisteredEmail } from "@/lib/email/templates/creator/BankAccountRegisteredEmail";


export async function GET(
    request: NextRequest,
    { params }: { params: { handle: string } }
) {
    try {
        const { handle } = params;

        // Get creator by handle
        const creator = await prisma.creatorProfile.findUnique({
            where: { handle },
            include: {
                bankAccount: true
            }
        });

        if (!creator) {
            return NextResponse.json(
                { error: "Creator not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ bankAccount: creator.bankAccount });

    } catch (error) {
        console.error("Error fetching bank account:", error);
        return NextResponse.json(
            { error: "Failed to fetch bank account" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { handle: string } }
) {
    try {
        const { handle } = params;
        const body = await request.json();

        const {
            bankCode,
            bankName,
            branchCode,
            branchName,
            accountType,
            accountNumber,
            accountHolder,
        } = body;

        // Validate required fields
        if (!bankCode || !bankName || !branchCode || !branchName || !accountType || !accountNumber || !accountHolder) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get creator by handle
        const creator = await prisma.creatorProfile.findUnique({
            where: { handle },
            select: { id: true }
        });

        if (!creator) {
            return NextResponse.json(
                { error: "Creator not found" },
                { status: 404 }
            );
        }

        // Upsert bank account
        const bankAccount = await prisma.bankAccount.upsert({
            where: { creatorId: creator.id },
            update: {
                bankName: bankName,
                bankCode: bankCode,
                branchName: branchName,
                branchCode: branchCode,
                accountType: accountType,
                accountNumber: accountNumber,
                accountHolder: accountHolder,
            },
            create: {
                creatorId: creator.id,
                bankName: bankName,
                bankCode: bankCode,
                branchName: branchName,
                branchCode: branchCode,
                accountType: accountType,
                accountNumber: accountNumber,
                accountHolder: accountHolder,
            },
        });

        // 新規登録の場合のみメール送信
        const isNewRegistration = !await prisma.bankAccount.findUnique({
            where: { creatorId: creator.id }
        });

        if (isNewRegistration) {
            // クリエイター情報を取得
            const creatorWithUser = await prisma.creatorProfile.findUnique({
                where: { id: creator.id },
                include: { user: true }
            });

            if (creatorWithUser?.user?.email) {
                // メール送信
                await sendEmailSafe({
                    to: creatorWithUser.user.email,
                    subject: '振込先口座の登録が完了しました',
                    react: BankAccountRegisteredEmail({
                        creatorName: creatorWithUser.displayName,
                        creatorHandle: creatorWithUser.handle,
                        bankName: bankName,
                        branchName: branchName,
                        accountNumber: accountNumber,
                    }),
                    emailType: 'CREATOR_BANK_ACCOUNT_REGISTERED',
                    recipientId: creatorWithUser.userId,
                    metadata: {
                        creatorId: creator.id,
                        bankAccountId: bankAccount.id,
                    },
                });
            }
        }

        return NextResponse.json({ bankAccount });

    } catch (error) {
        console.error("Error saving bank account:", error);
        return NextResponse.json(
            { error: "Failed to save bank account" },
            { status: 500 }
        );
    }
}

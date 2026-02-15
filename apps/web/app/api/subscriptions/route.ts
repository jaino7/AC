import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmailSafe } from '@/lib/email/client';
import { PaymentInstructionsEmail } from '@/lib/email/templates/fan/PaymentInstructionsEmail';
import { generateIdentifierCode } from '@/lib/email/utils/formatters';
import { NewSubscriberEmail } from '@/lib/email/templates/creator/NewSubscriberEmail';

/**
 * サブスクリプション購読申し込みAPI
 * POST /api/subscriptions
 */
export async function POST(req: Request) {
    try {
        const { fanId, planId } = await req.json();

        // プラン情報を取得
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId },
            include: {
                creator: {
                    include: {
                        user: true,
                        bankAccount: true,
                    },
                },
            },
        });

        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        // ファン情報を取得
        const fan = await prisma.fanProfile.findUnique({
            where: { id: fanId },
            include: { user: true },
        });

        if (!fan || !fan.user?.email) {
            return NextResponse.json({ error: 'Fan not found' }, { status: 404 });
        }

        // 振込先銀行口座が登録されているか確認
        if (!plan.creator.bankAccount) {
            return NextResponse.json(
                { error: 'Bank account not registered' },
                { status: 400 }
            );
        }

        // 識別コードを生成
        const identifierCode = generateIdentifierCode();

        // トランザクションレコード作成（PENDING状態）
        const transaction = await prisma.transaction.create({
            data: {
                creatorId: plan.creatorId,
                amount: plan.price,
                status: 'PENDING',
                paymentMethod: 'BANK_TRANSFER',
                identifierCode: identifierCode,
                userId: fan.userId,
            },
        });

        // ファンに振込案内メールを送信 ⭐
        await sendEmailSafe({
            to: fan.user.email,
            subject: '【重要】お振込先のご案内',
            react: PaymentInstructionsEmail({
                fanName: fan.displayName || fan.user.name || 'お客様',
                creatorName: plan.creator.displayName,
                creatorHandle: plan.creator.handle,
                planName: plan.name,
                amount: plan.price,
                bankName: plan.creator.bankAccount.bankName,
                branchName: plan.creator.bankAccount.branchName,
                accountType: plan.creator.bankAccount.accountType,
                accountNumber: plan.creator.bankAccount.accountNumber,
                accountHolder: plan.creator.bankAccount.accountHolder,
                identifierCode: identifierCode,
            }),
            emailType: 'FAN_PAYMENT_INSTRUCTIONS',
            recipientId: fan.userId,
            metadata: {
                transactionId: transaction.id,
                planId: plan.id,
                amount: plan.price,
            },
        });

        // クリエイターに新規購読通知を送信
        if (plan.creator.user?.email) {
            await sendEmailSafe({
                to: plan.creator.user.email,
                subject: '新しい購読希望者が現れました',
                react: NewSubscriberEmail({
                    creatorName: plan.creator.displayName,
                    creatorHandle: plan.creator.handle,
                    fanName: fan.displayName || fan.user.name || '購読者',
                    planName: plan.name,
                    amount: plan.price,
                }),
                emailType: 'CREATOR_NEW_SUBSCRIBER',
                recipientId: plan.creator.userId,
                metadata: {
                    transactionId: transaction.id,
                    fanId: fan.id,
                    planId: plan.id,
                },
            });
        }

        return NextResponse.json({
            success: true,
            transaction: {
                id: transaction.id,
                identifierCode: identifierCode,
                amount: plan.price,
            },
        });
    } catch (error) {
        console.error('Subscription creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create subscription' },
            { status: 500 }
        );
    }
}

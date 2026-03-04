import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendEmailSafe } from '@/lib/email/client';
import { FanPasswordResetEmail } from '@/lib/email/templates/fan/FanPasswordResetEmail';

export async function POST(req: Request) {
    try {
        const { email, creatorHandle } = await req.json();

        if (!email || !creatorHandle) {
            return NextResponse.json({ error: 'メールアドレスとクリエイターが必要です' }, { status: 400 });
        }

        // メールアドレスからユーザーを取得（存在確認はしない - 列挙攻撃対策）
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, name: true, password: true }
        });

        // パスワード未設定（Google OAuth専用アカウント）またはユーザー不存在は無視
        if (user && user.password) {
            // 既存の未使用トークンを無効化
            await prisma.passwordResetToken.updateMany({
                where: { userId: user.id, usedAt: null },
                data: { usedAt: new Date() }
            });

            const token = randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

            await prisma.passwordResetToken.create({
                data: { userId: user.id, token, expiresAt }
            });

            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const resetUrl = `${baseUrl}/${creatorHandle}/password-reset/confirm?token=${token}`;
            const fanName = user.name || email.split('@')[0];

            await sendEmailSafe({
                to: email,
                subject: 'パスワード再設定のご案内',
                react: FanPasswordResetEmail({ fanName, resetUrl }),
                emailType: 'FAN_PASSWORD_RESET',
                recipientId: user.id,
            });
        }

        // 常に同じレスポンスを返す（列挙攻撃対策）
        return NextResponse.json({
            message: 'パスワード再設定用のメールを送信しました（登録済みの場合）'
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 });
    }
}

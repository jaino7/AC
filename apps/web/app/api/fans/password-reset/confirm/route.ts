import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'argon2';

export async function POST(req: Request) {
    try {
        const { token, newPassword, confirmPassword } = await req.json();

        if (!token || !newPassword || !confirmPassword) {
            return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json({ error: 'パスワードが一致しません' }, { status: 400 });
        }

        if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            return NextResponse.json(
                { error: 'パスワードは8文字以上で、英字と数字を含めてください' },
                { status: 400 }
            );
        }

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            select: { id: true, userId: true, expiresAt: true, usedAt: true }
        });

        if (!resetToken || resetToken.usedAt) {
            return NextResponse.json({ error: '無効または使用済みのトークンです' }, { status: 400 });
        }

        if (resetToken.expiresAt < new Date()) {
            return NextResponse.json({ error: 'トークンの有効期限が切れています' }, { status: 400 });
        }

        const hashedPassword = await hash(newPassword);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetToken.userId },
                data: { password: hashedPassword }
            }),
            prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { usedAt: new Date() }
            })
        ]);

        return NextResponse.json({ message: 'パスワードを変更しました' });
    } catch (error) {
        console.error('Password reset confirm error:', error);
        return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 });
    }
}

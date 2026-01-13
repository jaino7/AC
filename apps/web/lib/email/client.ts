import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { EmailType, EmailStatus } from '@prisma/client';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    to: string;
    subject: string;
    react: React.ReactElement;
    emailType: EmailType;
    recipientId?: string;
    metadata?: Record<string, any>;
}

/**
 * メール送信とログ記録を行う関数
 */
export async function sendEmail({
    to,
    subject,
    react,
    emailType,
    recipientId,
    metadata,
}: SendEmailParams) {
    // EmailLogレコードを作成
    const emailLog = await prisma.emailLog.create({
        data: {
            toEmail: to,
            subject,
            emailType,
            recipientId,
            metadata,
            status: 'PENDING',
        },
    });

    try {
        // Resendでメール送信
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM_ADDRESS || 'CreatorSpace <noreply@creatorspace.jp>',
            to,
            subject,
            react,
        });

        if (error) {
            // 送信失敗
            await prisma.emailLog.update({
                where: { id: emailLog.id },
                data: {
                    status: 'FAILED',
                    errorMessage: error.message,
                },
            });

            console.error('Email sending failed:', error);
            return { success: false, error, emailLogId: emailLog.id };
        }

        // 送信成功
        await prisma.emailLog.update({
            where: { id: emailLog.id },
            data: {
                status: 'SENT',
                sentAt: new Date(),
            },
        });

        console.log('Email sent successfully:', { to, subject, messageId: data?.id });
        return { success: true, id: data?.id, emailLogId: emailLog.id };

    } catch (error: any) {
        // 例外発生時
        await prisma.emailLog.update({
            where: { id: emailLog.id },
            data: {
                status: 'FAILED',
                errorMessage: error.message,
            },
        });

        console.error('Email sending exception:', error);
        return { success: false, error, emailLogId: emailLog.id };
    }
}

/**
 * テスト用：開発環境でメールをコンソールに出力
 */
export async function sendEmailDev(params: SendEmailParams) {
    console.log('📧 [DEV] Email would be sent:');
    console.log('To:', params.to);
    console.log('Subject:', params.subject);
    console.log('Type:', params.emailType);
    console.log('Metadata:', params.metadata);

    // ログだけ記録
    const emailLog = await prisma.emailLog.create({
        data: {
            toEmail: params.to,
            subject: params.subject,
            emailType: params.emailType,
            recipientId: params.recipientId,
            metadata: params.metadata,
            status: 'SENT',
            sentAt: new Date(),
        },
    });

    return { success: true, emailLogId: emailLog.id, dev: true };
}

// 環境に応じてエクスポート
export const sendEmailSafe = process.env.NODE_ENV === 'production'
    ? sendEmail
    : sendEmailDev;

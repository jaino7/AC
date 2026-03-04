import { Resend } from 'resend';
import { renderAsync } from '@react-email/render';
import { prisma } from '@/lib/prisma';
import React from 'react';

interface SendEmailParams {
    to: string;
    subject: string;
    react: React.ReactElement;
    emailType: string;
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
    const resend = new Resend(process.env.RESEND_API_KEY);

    // EmailLogレコードを作成
    const emailLog = await prisma.emailLog.create({
        data: {
            toEmail: to,
            subject,
            emailType: emailType as any,
            recipientId,
            metadata,
            status: 'PENDING',
        },
    });

    try {
        // React EmailコンポーネントをHTMLに事前レンダリング
        const html = await renderAsync(react);

        // Resendでメール送信
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM_ADDRESS || 'CocoBa <noreply@getcocoba.com>',
            to,
            subject,
            html,
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
        }).catch(() => {/* ignore update failure */});

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
            emailType: params.emailType as any,
            recipientId: params.recipientId,
            metadata: params.metadata,
            status: 'SENT',
            sentAt: new Date(),
        },
    });

    return { success: true, emailLogId: emailLog.id, dev: true };
}

// 環境に応じてエクスポート
// RESEND_API_KEY が設定されていれば本番メール送信、なければ開発モード
export async function sendEmailSafe(params: SendEmailParams) {
    if (process.env.RESEND_API_KEY) {
        return sendEmail(params);
    }
    return sendEmailDev(params);
}

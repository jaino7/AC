import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) { }

    async createPendingTransaction(
        userId: string,
        planId: string,
        creatorId: string,
    ) {
        // プラン情報取得
        const plan = await this.prisma.subscriptionPlan.findUnique({
            where: { id: planId },
        });

        if (!plan) {
            throw new NotFoundException('プランが見つかりません');
        }

        // 識別コード生成（userIdの下8桁）
        const identifierCode = userId.slice(-8).padStart(8, '0');

        // Transaction作成
        const transaction = await this.prisma.transaction.create({
            data: {
                creatorId,
                userId,
                amount: plan.price,
                status: 'PENDING',
                paymentMethod: 'BANK_TRANSFER',
                identifierCode,
            },
        });

        // 振込先口座情報取得
        const bankAccount = await this.prisma.bankAccount.findUnique({
            where: { creatorId },
        });

        // デフォルト振込先情報（BankAccountが未設定の場合）
        const defaultBankInfo = {
            bankName: '住信SBIネット銀行',
            branchName: '法人第一支店',
            accountType: '普通',
            accountNumber: '1234567',
            accountHolder: 'カ）サンプル',
        };

        const bankInfo = bankAccount
            ? {
                bankName: bankAccount.bankName,
                branchName: bankAccount.branchName,
                accountType: bankAccount.accountType,
                accountNumber: bankAccount.accountNumber,
                accountHolder: bankAccount.accountHolder,
            }
            : defaultBankInfo;

        return {
            transactionId: transaction.id,
            amount: transaction.amount,
            status: transaction.status,
            identifierCode: transaction.identifierCode,
            bankInfo: {
                ...bankInfo,
                transferInstructions: `振込名義人を「${identifierCode} [あなたの名前]」に変更してください。例: 「${identifierCode} ヤマダタロウ」`,
            },
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後
        };
    }
}

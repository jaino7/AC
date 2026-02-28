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

        // Transaction作成
        const transaction = await this.prisma.transaction.create({
            data: {
                creatorId,
                userId,
                amount: plan.price,
                status: 'PENDING',
                paymentMethod: 'BANK_TRANSFER',
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
            bankInfo: {
                ...bankInfo,
                transferInstructions: `振込名義人を「[あなたの名前]」に変更してください。例: 「ヤマダタロウ」`,
            },
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後
        };
    }
}

import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post()
    // @UseGuards(JwtAuthGuard) // TODO: 認証ガードを実装後に有効化
    async createTransaction(
        @Request() req: any,
        @Body() dto: { planId: string; creatorId: string },
    ) {
        // TODO: 認証後は req.user.id を使用
        const userId = req.body.userId || 'test-user-id';

        return this.transactionsService.createPendingTransaction(
            userId,
            dto.planId,
            dto.creatorId,
        );
    }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const creators_module_1 = require("./creators/creators.module");
const transactions_module_1 = require("./transactions/transactions.module");
const bank_transfers_module_1 = require("./bank-transfers/bank-transfers.module");
const payments_module_1 = require("./payments/payments.module");
const mail_module_1 = require("./mail/mail.module");
const domains_module_1 = require("./domains/domains.module");
const webhooks_module_1 = require("./webhooks/webhooks.module");
const admin_module_1 = require("./admin/admin.module");
const notifications_module_1 = require("./notifications/notifications.module");
const revenue_module_1 = require("./revenue/revenue.module");
const storage_module_1 = require("./storage/storage.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            schedule_1.ScheduleModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
            creators_module_1.CreatorsModule,
            transactions_module_1.TransactionsModule,
            bank_transfers_module_1.BankTransfersModule,
            payments_module_1.PaymentsModule,
            mail_module_1.MailModule,
            domains_module_1.DomainsModule,
            webhooks_module_1.WebhooksModule,
            admin_module_1.AdminModule,
            notifications_module_1.NotificationsModule,
            revenue_module_1.RevenueModule,
            storage_module_1.StorageModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
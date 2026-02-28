"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const mail_module_1 = require("../mail/mail.module");
const creators_controller_1 = require("./creators.controller");
const creators_service_1 = require("./creators.service");
const domains_controller_1 = require("./domains.controller");
const domains_service_1 = require("./domains.service");
const brand_assets_controller_1 = require("./brand-assets.controller");
const brand_assets_service_1 = require("./brand-assets.service");
const analytics_controller_1 = require("./analytics.controller");
const analytics_service_1 = require("./analytics.service");
const page_views_controller_1 = require("./page-views.controller");
const page_views_service_1 = require("./page-views.service");
const notifications_controller_1 = require("./notifications.controller");
const notifications_service_1 = require("./notifications.service");
const storage_module_1 = require("../storage/storage.module");
let CreatorsModule = class CreatorsModule {
};
exports.CreatorsModule = CreatorsModule;
exports.CreatorsModule = CreatorsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, mail_module_1.MailModule, storage_module_1.StorageModule],
        controllers: [creators_controller_1.CreatorsController, domains_controller_1.DomainsController, brand_assets_controller_1.BrandAssetsController, analytics_controller_1.AnalyticsController, page_views_controller_1.PageViewsController, notifications_controller_1.NotificationsController],
        providers: [creators_service_1.CreatorsService, domains_service_1.DomainsService, brand_assets_service_1.BrandAssetsService, analytics_service_1.AnalyticsService, page_views_service_1.PageViewsService, notifications_service_1.NotificationsService],
        exports: [domains_service_1.DomainsService, brand_assets_service_1.BrandAssetsService, analytics_service_1.AnalyticsService, page_views_service_1.PageViewsService, notifications_service_1.NotificationsService]
    })
], CreatorsModule);
//# sourceMappingURL=creators.module.js.map
import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { MailModule } from "../mail/mail.module";
import { CreatorsController } from "./creators.controller";
import { CreatorsService } from "./creators.service";
import { DomainsController } from "./domains.controller";
import { DomainsService } from "./domains.service";
import { BrandAssetsController } from "./brand-assets.controller";
import { BrandAssetsService } from "./brand-assets.service";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { PageViewsController } from "./page-views.controller";
import { PageViewsService } from "./page-views.service";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [PrismaModule, MailModule, StorageModule],
  controllers: [CreatorsController, DomainsController, BrandAssetsController, AnalyticsController, PageViewsController, NotificationsController],
  providers: [CreatorsService, DomainsService, BrandAssetsService, AnalyticsService, PageViewsService, NotificationsService],
  exports: [DomainsService, BrandAssetsService, AnalyticsService, PageViewsService, NotificationsService]
})
export class CreatorsModule { }

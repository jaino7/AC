import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordService } from './discord.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [ConfigModule],
  controllers: [NotificationsController],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class NotificationsModule {}

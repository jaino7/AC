import { Controller, Post, Body, Logger } from '@nestjs/common';
import { IsString, IsNumber, IsEmail } from 'class-validator';
import { DiscordService } from './discord.service';

export class BanInquiryDto {
  @IsString()
  userId!: string;

  @IsString()
  fanProfileId!: string;

  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsNumber()
  tier!: number;

  @IsNumber()
  trustScore!: number;

  @IsString()
  transferDetails!: string;

  @IsString()
  message!: string;

  @IsString()
  adminLink!: string;
}

export class PaymentNotificationDto {
  @IsString()
  userId!: string;

  @IsString()
  userName!: string;

  @IsNumber()
  amount!: number;

  @IsString()
  creatorName!: string;

  @IsNumber()
  tier!: number;

  @IsNumber()
  trustScore!: number;

  @IsString()
  adminLink!: string;
}

@Controller('notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly discordService: DiscordService) { }

  @Post('ban-inquiry')
  async sendBanInquiry(@Body() dto: BanInquiryDto) {
    this.logger.log(`Received ban inquiry for user ${dto.userId}`);

    try {
      await this.discordService.sendBanInquiry({
        userId: dto.userId,
        name: dto.name,
        email: dto.email,
        tier: dto.tier,
        trustScore: dto.trustScore,
        transferDetails: dto.transferDetails,
        message: dto.message,
        adminLink: dto.adminLink,
      });

      return {
        success: true,
        message: 'Ban inquiry notification sent',
      };
    } catch (error) {
      this.logger.error('Failed to send ban inquiry notification', error);
      throw error;
    }
  }

  @Post('payment')
  async sendPaymentNotification(@Body() dto: PaymentNotificationDto) {
    this.logger.log(`Received payment notification for user ${dto.userId}`);

    try {
      await this.discordService.sendPaymentNotification({
        userId: dto.userId,
        userName: dto.userName,
        amount: dto.amount,
        creatorName: dto.creatorName,
        tier: dto.tier,
        trustScore: dto.trustScore,
        adminLink: dto.adminLink,
      });

      return {
        success: true,
        message: 'Payment notification sent',
      };
    } catch (error) {
      this.logger.error('Failed to send payment notification', error);
      throw error;
    }
  }
}

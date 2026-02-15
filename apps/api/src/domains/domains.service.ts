import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudflareService } from './cloudflare.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { DomainStatus } from '@prisma/client';

@Injectable()
export class DomainsService {
  private readonly logger = new Logger(DomainsService.name);

  constructor(
    private prisma: PrismaService,
    private cloudflare: CloudflareService,
  ) {}

  /**
   * Check if creator has access to custom domain feature
   */
  private async checkCreatorPlanAccess(creatorId: string): Promise<boolean> {
    const subscription = await this.prisma.creatorSubscription.findUnique({
      where: { creatorId },
      include: { plan: true },
    });

    if (!subscription) {
      return false;
    }

    // Only LITE and BUSINESS plans have custom domain access
    const hasAccess =
      subscription.status === 'ACTIVE' &&
      (subscription.plan.type === 'LITE' ||
        subscription.plan.type === 'BUSINESS');

    return hasAccess;
  }

  /**
   * Get domain by creator ID
   */
  async getDomainByCreatorId(creatorId: string) {
    const domain = await this.prisma.domain.findFirst({
      where: { creatorId },
    });

    return domain;
  }

  /**
   * Create or update custom domain
   */
  async createDomain(creatorId: string, dto: CreateDomainDto) {
    // Check if creator has plan access
    const hasAccess = await this.checkCreatorPlanAccess(creatorId);
    if (!hasAccess) {
      throw new ForbiddenException(
        'カスタムドメインを使用するには、LiteまたはBusinessプランへのアップグレードが必要です。',
      );
    }

    // Check if Cloudflare is configured
    if (!this.cloudflare.isConfigured()) {
      throw new BadRequestException(
        'カスタムドメイン機能は現在利用できません。',
      );
    }

    // Check if domain already exists (for any creator)
    const existingDomain = await this.prisma.domain.findUnique({
      where: { domain: dto.domain },
    });

    if (existingDomain && existingDomain.creatorId !== creatorId) {
      throw new ConflictException(
        'このドメインは既に使用されています。',
      );
    }

    try {
      // Create custom hostname in Cloudflare
      const cfHostname = await this.cloudflare.createCustomHostname(dto.domain);

      // Extract SSL validation records
      const sslValidationRecords =
        cfHostname.ssl.validation_records?.map((record) => ({
          txt_name: record.txt_name,
          txt_value: record.txt_value,
        })) || [];

      // Create or update domain in database
      const domain = await this.prisma.domain.upsert({
        where: { domain: dto.domain },
        create: {
          creatorId,
          domain: dto.domain,
          status: DomainStatus.PENDING,
          cloudflareHostnameId: cfHostname.id,
          sslValidationRecords,
          sslStatus: cfHostname.ssl.status,
        },
        update: {
          status: DomainStatus.PENDING,
          cloudflareHostnameId: cfHostname.id,
          sslValidationRecords,
          sslStatus: cfHostname.ssl.status,
          lastError: null,
        },
      });

      this.logger.log(`Domain created/updated: ${dto.domain} for creator ${creatorId}`);

      return domain;
    } catch (error) {
      this.logger.error(`Failed to create domain: ${(error as any).message}`);
      throw new BadRequestException(
        `ドメインの登録に失敗しました: ${(error as any).message}`,
      );
    }
  }

  /**
   * Verify domain DNS configuration
   */
  async verifyDomain(creatorId: string, domainId: string) {
    const domain = await this.prisma.domain.findUnique({
      where: { id: domainId },
    });

    if (!domain) {
      throw new NotFoundException('ドメインが見つかりません。');
    }

    if (domain.creatorId !== creatorId) {
      throw new ForbiddenException('このドメインへのアクセス権限がありません。');
    }

    if (!domain.cloudflareHostnameId) {
      throw new BadRequestException('Cloudflare Hostname IDが設定されていません。');
    }

    try {
      // Get latest status from Cloudflare
      const cfHostname = await this.cloudflare.getCustomHostname(
        domain.cloudflareHostnameId,
      );

      // Update SSL validation records if changed
      const sslValidationRecords =
        cfHostname.ssl.validation_records?.map((record) => ({
          txt_name: record.txt_name,
          txt_value: record.txt_value,
        })) || [];

      // Determine domain status based on Cloudflare response
      let newStatus = domain.status;
      let sslEnabled = false;
      let sslIssuedAt = domain.sslIssuedAt;
      let verifiedAt = domain.verifiedAt;

      if (cfHostname.status === 'active' && cfHostname.ssl.status === 'active') {
        newStatus = DomainStatus.ACTIVE;
        sslEnabled = true;
        sslIssuedAt = sslIssuedAt || new Date();
        verifiedAt = verifiedAt || new Date();
      } else if (
        cfHostname.status === 'pending' ||
        cfHostname.ssl.status === 'pending_validation'
      ) {
        newStatus = DomainStatus.VERIFYING;
      } else if (cfHostname.verification_errors && cfHostname.verification_errors.length > 0) {
        newStatus = DomainStatus.FAILED;
      }

      // Update domain in database
      const updatedDomain = await this.prisma.domain.update({
        where: { id: domainId },
        data: {
          status: newStatus,
          sslValidationRecords,
          sslStatus: cfHostname.ssl.status,
          sslEnabled,
          sslIssuedAt,
          verifiedAt,
          lastError: cfHostname.verification_errors?.join(', ') || null,
        },
      });

      this.logger.log(`Domain verified: ${domain.domain} - Status: ${newStatus}`);

      return updatedDomain;
    } catch (error) {
      this.logger.error(`Failed to verify domain: ${(error as any).message}`);
      throw new BadRequestException(
        `ドメインの検証に失敗しました: ${(error as any).message}`,
      );
    }
  }

  /**
   * Delete custom domain
   */
  async deleteDomain(creatorId: string, domainId: string) {
    const domain = await this.prisma.domain.findUnique({
      where: { id: domainId },
    });

    if (!domain) {
      throw new NotFoundException('ドメインが見つかりません。');
    }

    if (domain.creatorId !== creatorId) {
      throw new ForbiddenException('このドメインへのアクセス権限がありません。');
    }

    try {
      // Delete from Cloudflare if hostname ID exists
      if (domain.cloudflareHostnameId) {
        await this.cloudflare.deleteCustomHostname(domain.cloudflareHostnameId);
      }

      // Delete from database
      await this.prisma.domain.delete({
        where: { id: domainId },
      });

      this.logger.log(`Domain deleted: ${domain.domain}`);

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to delete domain: ${(error as any).message}`);
      throw new BadRequestException(
        `ドメインの削除に失敗しました: ${(error as any).message}`,
      );
    }
  }

  /**
   * Get creator by custom domain
   */
  async getCreatorByDomain(hostname: string) {
    const domain = await this.prisma.domain.findUnique({
      where: {
        domain: hostname,
        status: DomainStatus.ACTIVE,
      },
      include: {
        creator: {
          select: {
            id: true,
            handle: true,
            displayName: true,
            theme: true,
            creatorSubscription: {
              select: {
                status: true,
                endDate: true,
              },
            },
          },
        },
      },
    });

    return domain;
  }
}

import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { DomainStatus } from '@prisma/client';
import * as crypto from 'crypto';
import * as dns from 'dns';
import { exec } from 'child_process';

const TARGET_DOMAIN = 'getcocoba.com';

@Injectable()
export class DomainsService {
  private readonly logger = new Logger(DomainsService.name);

  constructor(
    private prisma: PrismaService,
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
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Create or update domain in database
      const domain = await this.prisma.domain.upsert({
        where: { domain: dto.domain },
        create: {
          creatorId,
          domain: dto.domain,
          status: DomainStatus.PENDING,
          verificationToken,
          dnsRecords: {
            cname: { host: dto.domain, target: TARGET_DOMAIN },
          },
        },
        update: {
          status: DomainStatus.PENDING,
          verificationToken,
          lastError: null,
          dnsRecords: {
            cname: { host: dto.domain, target: TARGET_DOMAIN },
          },
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
   * Verify domain DNS configuration via CNAME/A record lookup
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

    try {
      // DNS検証: CNAME または A/AAAAレコードで確認
      let isVerified = false;

      // 1. CNAME検証
      try {
        const cnameRecords = await dns.promises.resolveCname(domain.domain);
        isVerified = cnameRecords.some(
          (record) => record.toLowerCase() === TARGET_DOMAIN || record.toLowerCase().endsWith(`.${TARGET_DOMAIN}`),
        );
      } catch {
        // CNAME not found - try A record
      }

      // 2. CNAMEがない場合、Aレコードで検証（Cloudflareプロキシ対応）
      if (!isVerified) {
        try {
          const domainIPs = await dns.promises.resolve4(domain.domain).catch(() => []);
          // ドメインが何らかのIPに解決できれば、DNSは設定済みとみなす
          if (domainIPs.length > 0) {
            isVerified = true;
          }
        } catch {
          // DNS resolution failed
        }
      }

      let newStatus: DomainStatus;
      let verifiedAt = domain.verifiedAt;
      let lastError: string | null = null;

      if (isVerified) {
        newStatus = DomainStatus.ACTIVE;
        verifiedAt = verifiedAt || new Date();

        // SSL証明書を自動発行
        this.issueSslCertificate(domain.domain);
      } else {
        newStatus = DomainStatus.VERIFYING;
        lastError = 'DNSレコードが見つかりません。CNAME設定を確認してください。';
      }

      const updatedDomain = await this.prisma.domain.update({
        where: { id: domainId },
        data: {
          status: newStatus,
          verifiedAt,
          lastError,
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
   * SSL証明書を自動発行（非同期・バックグラウンド）
   */
  private issueSslCertificate(domain: string) {
    // ドメイン名のバリデーション（コマンドインジェクション防止）
    if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]+[a-zA-Z0-9]$/.test(domain)) {
      this.logger.warn(`Invalid domain format for SSL: ${domain}`);
      return;
    }

    const cmd = `sudo /usr/local/bin/cocoba-issue-cert.sh ${domain}`;
    this.logger.log(`Issuing SSL certificate for ${domain}`);

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        this.logger.error(`SSL cert failed for ${domain}: ${error.message}`);
        return;
      }
      if (stderr) {
        this.logger.warn(`SSL cert stderr for ${domain}: ${stderr}`);
      }
      this.logger.log(`SSL cert result for ${domain}: ${stdout}`);
    });
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

    return domain || { creator: null };
  }
}

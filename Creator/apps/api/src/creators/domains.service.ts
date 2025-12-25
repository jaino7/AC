import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException
} from "@nestjs/common";
import { DomainStatus } from "@prisma/client";
import { randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { AddDomainDto } from "./dto/add-domain.dto";

@Injectable()
export class DomainsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * ドメインを追加し、DNS検証用トークンを生成
     */
    async addDomain(payload: AddDomainDto) {
        // クリエイタープロフィールの存在確認
        const creator = await this.prisma.creatorProfile.findUnique({
            where: { id: payload.creatorId }
        });

        if (!creator) {
            throw new NotFoundException("クリエイターが見つかりません");
        }

        // 既に登録されているドメインか確認
        const existing = await this.prisma.domain.findUnique({
            where: { domain: payload.domain }
        });

        if (existing) {
            throw new ConflictException("このドメインは既に登録されています");
        }

        // DNS検証用トークンを生成
        const verificationToken = this.generateVerificationToken();

        // ドメインを作成
        const domain = await this.prisma.domain.create({
            data: {
                domain: payload.domain,
                creatorId: payload.creatorId,
                status: DomainStatus.PENDING,
                verificationToken,
                dnsRecords: {
                    CNAME: `verify.creator-platform.com`,
                    TXT: `creator-verification=${verificationToken}`
                }
            },
            include: {
                creator: {
                    select: {
                        handle: true,
                        displayName: true
                    }
                }
            }
        });

        return {
            id: domain.id,
            domain: domain.domain,
            status: domain.status,
            verificationToken: domain.verificationToken,
            dnsRecords: domain.dnsRecords,
            createdAt: domain.createdAt,
            creator: domain.creator
        };
    }

    /**
     * DNS検証を実行
     */
    async verifyDomain(domainId: string) {
        const domain = await this.prisma.domain.findUnique({
            where: { id: domainId }
        });

        if (!domain) {
            throw new NotFoundException("ドメインが見つかりません");
        }

        if (domain.status === DomainStatus.ACTIVE) {
            return {
                id: domain.id,
                domain: domain.domain,
                status: domain.status,
                message: "このドメインは既に検証済みです"
            };
        }

        // ステータスを検証中に更新
        await this.prisma.domain.update({
            where: { id: domainId },
            data: { status: DomainStatus.VERIFYING }
        });

        // DNS検証ロジック（モック実装）
        // 本番環境では実際のDNSクエリを実行
        const isVerified = await this.performDnsVerification(
            domain.domain,
            domain.verificationToken || ""
        );

        if (isVerified) {
            const updatedDomain = await this.prisma.domain.update({
                where: { id: domainId },
                data: {
                    status: DomainStatus.ACTIVE,
                    verifiedAt: new Date()
                }
            });

            return {
                id: updatedDomain.id,
                domain: updatedDomain.domain,
                status: updatedDomain.status,
                verifiedAt: updatedDomain.verifiedAt,
                message: "ドメインの検証に成功しました"
            };
        } else {
            await this.prisma.domain.update({
                where: { id: domainId },
                data: { status: DomainStatus.FAILED }
            });

            throw new BadRequestException(
                "DNS検証に失敗しました。DNSレコードが正しく設定されているか確認してください"
            );
        }
    }

    /**
     * クリエイターのドメイン一覧を取得
     */
    async getDomains(creatorId: string) {
        const domains = await this.prisma.domain.findMany({
            where: { creatorId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                domain: true,
                status: true,
                verificationToken: true,
                dnsRecords: true,
                verifiedAt: true,
                sslEnabled: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return domains;
    }

    /**
     * ドメインを削除
     */
    async deleteDomain(domainId: string, creatorId: string) {
        const domain = await this.prisma.domain.findUnique({
            where: { id: domainId }
        });

        if (!domain) {
            throw new NotFoundException("ドメインが見つかりません");
        }

        if (domain.creatorId !== creatorId) {
            throw new BadRequestException("このドメインを削除する権限がありません");
        }

        await this.prisma.domain.delete({
            where: { id: domainId }
        });

        return {
            message: "ドメインを削除しました",
            domain: domain.domain
        };
    }

    /**
     * ドメイン名からクリエイターハンドルを取得（ミドルウェア用）
     */
    async getCreatorHandleByDomain(domain: string): Promise<string | null> {
        const domainRecord = await this.prisma.domain.findUnique({
            where: {
                domain,
                status: DomainStatus.ACTIVE
            },
            include: {
                creator: {
                    select: {
                        handle: true
                    }
                }
            }
        });

        return domainRecord?.creator.handle || null;
    }

    /**
     * DNS検証用トークンを生成
     */
    private generateVerificationToken(): string {
        return randomBytes(32).toString("hex");
    }

    /**
     * DNS検証を実行（モック実装）
     * 本番環境では実際のDNSクエリライブラリを使用
     */
    private async performDnsVerification(
        domain: string,
        expectedToken: string
    ): Promise<boolean> {
        // TODO: 本番環境では dns.promises.resolveTxt() などを使用
        // 開発環境ではモックとして常にtrueを返す
        console.log(`[DNS検証モック] ドメイン: ${domain}, トークン: ${expectedToken}`);

        // 開発環境では自動的に検証成功とする
        // 本番環境では以下のような実装になる:
        /*
        try {
          const records = await dns.promises.resolveTxt(domain);
          const txtRecords = records.flat();
          return txtRecords.some(record => 
            record.includes(`creator-verification=${expectedToken}`)
          );
        } catch (error) {
          return false;
        }
        */

        return true;
    }
}

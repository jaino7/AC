import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query
} from "@nestjs/common";
import { DomainsService } from "./domains.service";
import { AddDomainDto } from "./dto/add-domain.dto";

@Controller("creators/domains")
export class DomainsController {
    constructor(private readonly domainsService: DomainsService) { }

    /**
     * ドメインからクリエイターハンドルを取得（ミドルウェア用）
     * GET /creators/domains/lookup?domain=xxx
     */
    @Get("lookup")
    async lookupDomain(@Query("domain") domain: string) {
        const handle = await this.domainsService.getCreatorHandleByDomain(domain);

        if (!handle) {
            return { handle: null };
        }

        return { handle };
    }

    /**
     * ドメインを追加
     * POST /creators/domains
     */
    @Post()
    async addDomain(@Body() addDomainDto: AddDomainDto) {
        return this.domainsService.addDomain(addDomainDto);
    }

    /**
     * DNS検証を実行
     * GET /creators/domains/:id/verify
     */
    @Get(":id/verify")
    async verifyDomain(@Param("id") id: string) {
        return this.domainsService.verifyDomain(id);
    }

    /**
     * ドメイン一覧を取得
     * GET /creators/domains?creatorId=xxx
     */
    @Get()
    async getDomains(@Query("creatorId") creatorId: string) {
        return this.domainsService.getDomains(creatorId);
    }

    /**
     * ドメインを削除
     * DELETE /creators/domains/:id?creatorId=xxx
     */
    @Delete(":id")
    async deleteDomain(
        @Param("id") id: string,
        @Query("creatorId") creatorId: string
    ) {
        return this.domainsService.deleteDomain(id, creatorId);
    }
}

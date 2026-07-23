import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DomainsService } from './domains.service';
import { CreateDomainDto } from './dto/create-domain.dto';

// Note: Add your auth guard here
// import { AuthGuard } from '../auth/auth.guard';

@Controller('domains')
// @UseGuards(AuthGuard) // Uncomment when auth guard is ready
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  /**
   * Get domain for authenticated creator
   */
  @Get('me')
  async getMyDomain(@Request() req: any) {
    // TODO: Get creatorId from authenticated user
    const creatorId = req.user?.creatorId || req.headers['x-creator-id'];
    return this.domainsService.getDomainByCreatorId(creatorId);
  }

  /**
   * Create or update custom domain
   */
  @Post()
  async createDomain(@Request() req: any, @Body() dto: CreateDomainDto) {
    // TODO: Get creatorId from authenticated user
    const creatorId = req.user?.creatorId || req.headers['x-creator-id'];
    return this.domainsService.createDomain(creatorId, dto);
  }

  /**
   * Verify domain DNS configuration
   */
  @Post(':domainId/verify')
  async verifyDomain(@Request() req: any, @Param('domainId') domainId: string) {
    // TODO: Get creatorId from authenticated user
    const creatorId = req.user?.creatorId || req.headers['x-creator-id'];
    return this.domainsService.verifyDomain(creatorId, domainId);
  }

  /**
   * Delete custom domain
   */
  @Delete(':domainId')
  async deleteDomain(@Request() req: any, @Param('domainId') domainId: string) {
    // TODO: Get creatorId from authenticated user
    const creatorId = req.user?.creatorId || req.headers['x-creator-id'];
    return this.domainsService.deleteDomain(creatorId, domainId);
  }

  /**
   * Get creator by custom domain (public endpoint)
   */
  @Get('lookup/:hostname')
  async getCreatorByDomain(@Param('hostname') hostname: string) {
    return this.domainsService.getCreatorByDomain(hostname);
  }
}

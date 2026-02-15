import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AccountLockGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];
    const creatorId = request.body?.creatorId || request.query?.creatorId;

    if (!userId || !creatorId) {
      // If no userId or creatorId, let the request pass
      // (other guards or controllers will handle authentication)
      return true;
    }

    // Find fan profile
    const fan = await this.prisma.fanProfile.findUnique({
      where: {
        userId_creatorId: {
          userId,
          creatorId,
        },
      },
    });

    // Check if account is locked
    if (fan?.isLocked) {
      throw new ForbiddenException({
        message: 'アカウントがロックされています',
        reason: fan.lockedReason,
        lockedAt: fan.lockedAt,
      });
    }

    return true;
  }
}

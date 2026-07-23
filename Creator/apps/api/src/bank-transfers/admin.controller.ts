import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Admin Controller for Bank Transfers
 * Provides endpoints for administrators to monitor cron jobs and system health
 */
@Controller('admin/cron-logs')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  /**
   * Get cron job execution history
   *
   * Query parameters:
   * - taskName: Filter by task name (optional)
   * - status: Filter by status (SUCCESS/FAILED) (optional)
   * - limit: Number of records to return (default: 100, max: 1000)
   * - offset: Number of records to skip (default: 0)
   *
   * Example: GET /api/admin/cron-logs?taskName=expire_charge_requests&limit=50
   */
  @Get()
  async getCronLogs(
    @Query('taskName') taskName?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = Math.min(parseInt(limit || '100'), 1000);
    const parsedOffset = parseInt(offset || '0');

    const where: any = {};
    if (taskName) {
      where.taskName = taskName;
    }
    if (status) {
      where.status = status.toUpperCase();
    }

    const [logs, total] = await Promise.all([
      this.prisma.cronLog.findMany({
        where,
        orderBy: {
          executedAt: 'desc',
        },
        take: parsedLimit,
        skip: parsedOffset,
      }),
      this.prisma.cronLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        total,
        limit: parsedLimit,
        offset: parsedOffset,
        hasMore: total > parsedOffset + parsedLimit,
      },
    };
  }

  /**
   * Get cron job statistics
   *
   * Returns summary statistics for each task:
   * - Total executions
   * - Success rate
   * - Average duration
   * - Last execution time
   *
   * Example: GET /api/admin/cron-logs/stats
   */
  @Get('stats')
  async getCronStats() {
    // Get all task names
    const tasks = await this.prisma.cronLog.groupBy({
      by: ['taskName'],
      _count: true,
    });

    const stats = await Promise.all(
      tasks.map(async (task) => {
        const [total, successful, failed, avgDuration, lastExecution] =
          await Promise.all([
            this.prisma.cronLog.count({
              where: { taskName: task.taskName },
            }),
            this.prisma.cronLog.count({
              where: { taskName: task.taskName, status: 'SUCCESS' },
            }),
            this.prisma.cronLog.count({
              where: { taskName: task.taskName, status: 'FAILED' },
            }),
            this.prisma.cronLog.aggregate({
              where: { taskName: task.taskName },
              _avg: { durationMs: true },
            }),
            this.prisma.cronLog.findFirst({
              where: { taskName: task.taskName },
              orderBy: { executedAt: 'desc' },
              select: {
                executedAt: true,
                status: true,
                recordsProcessed: true,
              },
            }),
          ]);

        return {
          taskName: task.taskName,
          totalExecutions: total,
          successful,
          failed,
          successRate: total > 0 ? (successful / total) * 100 : 0,
          avgDurationMs: avgDuration._avg.durationMs || 0,
          lastExecution: lastExecution
            ? {
                executedAt: lastExecution.executedAt,
                status: lastExecution.status,
                recordsProcessed: lastExecution.recordsProcessed,
              }
            : null,
        };
      }),
    );

    return { stats };
  }
}

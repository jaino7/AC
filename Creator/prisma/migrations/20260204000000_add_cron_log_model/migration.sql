-- CreateTable
CREATE TABLE "CronLog" (
    "id" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recordsProcessed" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CronLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CronLog_taskName_idx" ON "CronLog"("taskName");

-- CreateIndex
CREATE INDEX "CronLog_executedAt_idx" ON "CronLog"("executedAt");

-- CreateIndex
CREATE INDEX "CronLog_status_idx" ON "CronLog"("status");

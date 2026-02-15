-- AlterTable
ALTER TABLE "VirtualAccount" ADD COLUMN "releasedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "VirtualAccount_releasedAt_idx" ON "VirtualAccount"("releasedAt");

-- Comment
COMMENT ON COLUMN "VirtualAccount"."releasedAt" IS '解放日時（冷却期間管理用）';

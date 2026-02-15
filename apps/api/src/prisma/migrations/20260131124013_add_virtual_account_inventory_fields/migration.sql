-- AlterTable
ALTER TABLE "VirtualAccount" ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "assignedToUserId" TEXT,
ADD COLUMN     "isUsed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "VirtualAccount_isUsed_purpose_idx" ON "VirtualAccount"("isUsed", "purpose");

-- CreateIndex
CREATE INDEX "VirtualAccount_assignedToUserId_idx" ON "VirtualAccount"("assignedToUserId");

-- AddForeignKey
ALTER TABLE "VirtualAccount" ADD CONSTRAINT "VirtualAccount_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

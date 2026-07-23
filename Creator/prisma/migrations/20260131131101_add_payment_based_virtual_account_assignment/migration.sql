/*
  Warnings:

  - You are about to drop the column `assignedToUserId` on the `VirtualAccount` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "VirtualAccount" DROP CONSTRAINT "VirtualAccount_assignedToUserId_fkey";

-- DropIndex
DROP INDEX "VirtualAccount_assignedToUserId_idx";

-- AlterTable
ALTER TABLE "VirtualAccount" DROP COLUMN "assignedToUserId",
ADD COLUMN     "assignedToPaymentId" TEXT;

-- CreateIndex
CREATE INDEX "VirtualAccount_assignedToPaymentId_idx" ON "VirtualAccount"("assignedToPaymentId");

/*
  Warnings:

  - Added the required column `storageLimitBytes` to the `CreatorPlan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EarningType" AS ENUM ('SUBSCRIPTION', 'PURCHASE');

-- CreateEnum
CREATE TYPE "EarningStatus" AS ENUM ('PENDING', 'SETTLED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'SKIPPED');

-- AlterTable
ALTER TABLE "CreatorPlan" ADD COLUMN     "storageLimitBytes" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "CreatorProfile" ADD COLUMN     "storageLimitBytes" BIGINT,
ADD COLUMN     "storageUsedBytes" BIGINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CreatorSubscription" ADD COLUMN     "billingBalance" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "fileSize" BIGINT;

-- CreateTable
CREATE TABLE "CreatorEarning" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "grossAmount" INTEGER NOT NULL,
    "platformFee" INTEGER NOT NULL,
    "netAmount" INTEGER NOT NULL,
    "feeRate" DOUBLE PRECISION NOT NULL,
    "earningType" "EarningType" NOT NULL,
    "referenceId" TEXT,
    "settlementMonth" TEXT NOT NULL,
    "status" "EarningStatus" NOT NULL DEFAULT 'PENDING',
    "payoutId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorEarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorPayout" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "periodMonth" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreatorEarning_creatorId_status_idx" ON "CreatorEarning"("creatorId", "status");

-- CreateIndex
CREATE INDEX "CreatorEarning_creatorId_settlementMonth_idx" ON "CreatorEarning"("creatorId", "settlementMonth");

-- CreateIndex
CREATE INDEX "CreatorEarning_payoutId_idx" ON "CreatorEarning"("payoutId");

-- CreateIndex
CREATE INDEX "CreatorPayout_creatorId_status_idx" ON "CreatorPayout"("creatorId", "status");

-- CreateIndex
CREATE INDEX "CreatorPayout_periodMonth_status_idx" ON "CreatorPayout"("periodMonth", "status");

-- AddForeignKey
ALTER TABLE "CreatorEarning" ADD CONSTRAINT "CreatorEarning_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorEarning" ADD CONSTRAINT "CreatorEarning_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "CreatorPayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorPayout" ADD CONSTRAINT "CreatorPayout_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorPayout" ADD CONSTRAINT "CreatorPayout_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

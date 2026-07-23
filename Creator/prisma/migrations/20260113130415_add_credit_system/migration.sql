-- CreateEnum
CREATE TYPE "ChargeRequestStatus" AS ENUM ('PENDING', 'TRANSFERRED', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CreditHistoryType" AS ENUM ('CHARGE', 'PURCHASE', 'SUBSCRIBE', 'REFUND');

-- AlterTable
ALTER TABLE "FanProfile" ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ChargeRequest" (
    "id" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "ChargeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "identifierCode" TEXT NOT NULL,
    "transferorName" TEXT,
    "transferDate" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChargeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditHistory" (
    "id" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "type" "CreditHistoryType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "chargeRequestId" TEXT,
    "purchaseId" TEXT,
    "subscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChargeRequest_identifierCode_key" ON "ChargeRequest"("identifierCode");

-- CreateIndex
CREATE INDEX "ChargeRequest_fanId_idx" ON "ChargeRequest"("fanId");

-- CreateIndex
CREATE INDEX "ChargeRequest_identifierCode_idx" ON "ChargeRequest"("identifierCode");

-- CreateIndex
CREATE INDEX "ChargeRequest_status_idx" ON "ChargeRequest"("status");

-- CreateIndex
CREATE INDEX "CreditHistory_fanId_idx" ON "CreditHistory"("fanId");

-- CreateIndex
CREATE INDEX "CreditHistory_createdAt_idx" ON "CreditHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "ChargeRequest" ADD CONSTRAINT "ChargeRequest_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "FanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditHistory" ADD CONSTRAINT "CreditHistory_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "FanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

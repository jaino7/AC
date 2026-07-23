-- Add fields to FanProfile
ALTER TABLE "FanProfile" ADD COLUMN "tier" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "FanProfile" ADD COLUMN "trustScore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "FanProfile" ADD COLUMN "isLocked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "FanProfile" ADD COLUMN "lockedReason" TEXT;
ALTER TABLE "FanProfile" ADD COLUMN "lockedAt" TIMESTAMP(3);

-- Create enum
CREATE TYPE "BankTransferClaimStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- Create BankTransferClaim table
CREATE TABLE "BankTransferClaim" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fanId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "identifierCode" TEXT NOT NULL,
  "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" "BankTransferClaimStatus" NOT NULL DEFAULT 'PENDING',
  "approvedAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "immediateCredit" INTEGER NOT NULL DEFAULT 0,
  "pendingCredit" INTEGER NOT NULL DEFAULT 0,
  "chargeRequestId" TEXT NOT NULL,
  "bankTransferId" TEXT UNIQUE,
  "processedBy" TEXT,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BankTransferClaim_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "FanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "BankTransferClaim_chargeRequestId_fkey" FOREIGN KEY ("chargeRequestId") REFERENCES "ChargeRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "BankTransferClaim_bankTransferId_fkey" FOREIGN KEY ("bankTransferId") REFERENCES "BankTransfer"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX "BankTransferClaim_fanId_idx" ON "BankTransferClaim"("fanId");
CREATE INDEX "BankTransferClaim_chargeRequestId_idx" ON "BankTransferClaim"("chargeRequestId");
CREATE INDEX "BankTransferClaim_status_idx" ON "BankTransferClaim"("status");
CREATE INDEX "BankTransferClaim_claimedAt_idx" ON "BankTransferClaim"("claimedAt");

-- Add claim flag to ChargeRequest
ALTER TABLE "ChargeRequest" ADD COLUMN "hasClaim" BOOLEAN NOT NULL DEFAULT false;

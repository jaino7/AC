-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "identifierCode" TEXT,
ADD COLUMN     "transferDate" TIMESTAMP(3),
ADD COLUMN     "transferorName" TEXT,
ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "ProcessedEmail" (
    "id" TEXT NOT NULL,
    "emailUid" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedEmail_emailUid_key" ON "ProcessedEmail"("emailUid");

-- CreateIndex
CREATE INDEX "ProcessedEmail_emailUid_idx" ON "ProcessedEmail"("emailUid");

-- CreateIndex
CREATE INDEX "Transaction_identifierCode_idx" ON "Transaction"("identifierCode");

-- CreateIndex
CREATE INDEX "Transaction_userId_status_idx" ON "Transaction"("userId", "status");

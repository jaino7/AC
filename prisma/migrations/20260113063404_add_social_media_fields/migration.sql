-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('CREATOR_REGISTRATION', 'CREATOR_BANK_ACCOUNT_REGISTERED', 'CREATOR_NEW_SUBSCRIBER', 'CREATOR_PAYMENT_CONFIRMED', 'CREATOR_WITHDRAWAL_RECEIVED', 'CREATOR_WITHDRAWAL_COMPLETED', 'CREATOR_ANNOUNCEMENT', 'CREATOR_PASSWORD_RESET', 'FAN_EMAIL_VERIFICATION', 'FAN_PAYMENT_INSTRUCTIONS', 'FAN_SUBSCRIPTION_STARTED', 'FAN_RENEWAL_REMINDER', 'FAN_SUBSCRIPTION_EXPIRED', 'FAN_NEW_CONTENT', 'FAN_PASSWORD_RESET', 'FAN_RECEIPT');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'FAILED', 'BOUNCED');

-- AlterTable
ALTER TABLE "CreatorProfile" ADD COLUMN     "discordUrl" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "otherUrl" TEXT,
ADD COLUMN     "tiktokUrl" TEXT,
ADD COLUMN     "twitterUrl" TEXT;

-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "includesPurchasedContent" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT,
    "toEmail" TEXT NOT NULL,
    "emailType" "EmailType" NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailLog_recipientId_emailType_idx" ON "EmailLog"("recipientId", "emailType");

-- CreateIndex
CREATE INDEX "EmailLog_status_createdAt_idx" ON "EmailLog"("status", "createdAt");

-- CreateIndex
CREATE INDEX "EmailLog_toEmail_idx" ON "EmailLog"("toEmail");

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

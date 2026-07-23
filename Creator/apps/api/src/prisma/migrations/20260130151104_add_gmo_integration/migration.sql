-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'CREATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('PENDING', 'VERIFYING', 'ACTIVE', 'FAILED', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "IdentityDocumentType" AS ENUM ('DRIVERS_LICENSE', 'PASSPORT', 'MYNUMBER_CARD');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ChargeRequestStatus" AS ENUM ('PENDING', 'TRANSFERRED', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CreditHistoryType" AS ENUM ('CHARGE', 'PURCHASE', 'SUBSCRIBE', 'REFUND');

-- CreateEnum
CREATE TYPE "CreatorPlanType" AS ENUM ('FREE', 'LITE', 'BUSINESS');

-- CreateEnum
CREATE TYPE "CreatorSubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BankTransferType" AS ENUM ('CREATOR_PLAN', 'FAN_CREDIT');

-- CreateEnum
CREATE TYPE "BankTransferStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PURCHASE', 'ANNOUNCEMENT', 'PAYMENT_REMINDER', 'SUBSCRIBER', 'COMMENT');

-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('CREATOR_REGISTRATION', 'CREATOR_BANK_ACCOUNT_REGISTERED', 'CREATOR_NEW_SUBSCRIBER', 'CREATOR_PAYMENT_CONFIRMED', 'CREATOR_WITHDRAWAL_RECEIVED', 'CREATOR_WITHDRAWAL_COMPLETED', 'CREATOR_ANNOUNCEMENT', 'CREATOR_PASSWORD_RESET', 'FAN_EMAIL_VERIFICATION', 'FAN_PAYMENT_INSTRUCTIONS', 'FAN_SUBSCRIPTION_STARTED', 'FAN_RENEWAL_REMINDER', 'FAN_SUBSCRIPTION_EXPIRED', 'FAN_NEW_CONTENT', 'FAN_PASSWORD_RESET', 'FAN_RECEIPT');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'FAILED', 'BOUNCED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FanProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "displayName" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "preferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FanProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "CreatorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'creator-pro',
    "themeConfig" JSONB,
    "customDomain" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "twitterUrl" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "discordUrl" TEXT,
    "otherUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "features" JSONB,
    "includesPurchasedContent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "thumbnailUrl" TEXT,
    "mediaUrl" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "requiredPlanId" TEXT,
    "folderId" TEXT,
    "visibility" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedPost" (
    "id" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedPost_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTag" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostTag_pkey" PRIMARY KEY ("postId","tagId")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "amount" INTEGER NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paymentIntentId" TEXT,
    "userId" TEXT,
    "identifierCode" TEXT,
    "transferorName" TEXT,
    "transferDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCode" TEXT,
    "branchName" TEXT NOT NULL,
    "branchCode" TEXT,
    "accountType" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "status" "DomainStatus" NOT NULL DEFAULT 'PENDING',
    "dnsRecords" JSONB,
    "verificationToken" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "sslEnabled" BOOLEAN NOT NULL DEFAULT false,
    "sslIssuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "userAgent" TEXT,
    "referer" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityVerification" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "documentType" "IdentityDocumentType" NOT NULL,
    "frontImageKey" TEXT NOT NULL,
    "backImageKey" TEXT,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityVerification_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "CreatorPlan" (
    "id" TEXT NOT NULL,
    "planType" "CreatorPlanType" NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyPrice" INTEGER NOT NULL,
    "yearlyPrice" INTEGER NOT NULL,
    "feeRate" DOUBLE PRECISION NOT NULL,
    "features" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorSubscription" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "CreatorSubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "isYearly" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "nextBillingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirtualAccount" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT,
    "fanId" TEXT,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "branchCode" TEXT,
    "purpose" "BankTransferType" NOT NULL,
    "gmoAccountId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirtualAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankTransfer" (
    "id" TEXT NOT NULL,
    "virtualAccountId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "transferorName" TEXT NOT NULL,
    "transferDate" TIMESTAMP(3) NOT NULL,
    "type" "BankTransferType" NOT NULL,
    "status" "BankTransferStatus" NOT NULL DEFAULT 'PENDING',
    "gmoTransactionId" TEXT,
    "webhookPayload" JSONB,
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "creatorSubscriptionId" TEXT,
    "chargeRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "FanProfile_userId_idx" ON "FanProfile"("userId");

-- CreateIndex
CREATE INDEX "FanProfile_creatorId_idx" ON "FanProfile"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "FanProfile_userId_creatorId_key" ON "FanProfile"("userId", "creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProfile_userId_key" ON "CreatorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProfile_handle_key" ON "CreatorProfile"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProfile_customDomain_key" ON "CreatorProfile"("customDomain");

-- CreateIndex
CREATE INDEX "Subscription_fanId_idx" ON "Subscription"("fanId");

-- CreateIndex
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");

-- CreateIndex
CREATE INDEX "Purchase_fanId_idx" ON "Purchase"("fanId");

-- CreateIndex
CREATE INDEX "Purchase_postId_idx" ON "Purchase"("postId");

-- CreateIndex
CREATE INDEX "Purchase_fanId_purchasedAt_idx" ON "Purchase"("fanId", "purchasedAt");

-- CreateIndex
CREATE INDEX "SavedPost_fanId_idx" ON "SavedPost"("fanId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedPost_fanId_postId_key" ON "SavedPost"("fanId", "postId");

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

-- CreateIndex
CREATE INDEX "Folder_creatorId_idx" ON "Folder"("creatorId");

-- CreateIndex
CREATE INDEX "Tag_creatorId_idx" ON "Tag"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_creatorId_name_key" ON "Tag"("creatorId", "name");

-- CreateIndex
CREATE INDEX "PostTag_postId_idx" ON "PostTag"("postId");

-- CreateIndex
CREATE INDEX "PostTag_tagId_idx" ON "PostTag"("tagId");

-- CreateIndex
CREATE INDEX "Transaction_creatorId_status_idx" ON "Transaction"("creatorId", "status");

-- CreateIndex
CREATE INDEX "Transaction_subscriptionId_idx" ON "Transaction"("subscriptionId");

-- CreateIndex
CREATE INDEX "Transaction_identifierCode_idx" ON "Transaction"("identifierCode");

-- CreateIndex
CREATE INDEX "Transaction_userId_status_idx" ON "Transaction"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_creatorId_key" ON "BankAccount"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedEmail_emailUid_key" ON "ProcessedEmail"("emailUid");

-- CreateIndex
CREATE INDEX "ProcessedEmail_emailUid_idx" ON "ProcessedEmail"("emailUid");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_domain_key" ON "Domain"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_verificationToken_key" ON "Domain"("verificationToken");

-- CreateIndex
CREATE INDEX "Domain_creatorId_idx" ON "Domain"("creatorId");

-- CreateIndex
CREATE INDEX "Domain_status_idx" ON "Domain"("status");

-- CreateIndex
CREATE INDEX "PageView_creatorId_viewedAt_idx" ON "PageView"("creatorId", "viewedAt");

-- CreateIndex
CREATE INDEX "PageView_creatorId_path_idx" ON "PageView"("creatorId", "path");

-- CreateIndex
CREATE INDEX "Notification_creatorId_isRead_idx" ON "Notification"("creatorId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_creatorId_createdAt_idx" ON "Notification"("creatorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityVerification_creatorId_key" ON "IdentityVerification"("creatorId");

-- CreateIndex
CREATE INDEX "IdentityVerification_creatorId_idx" ON "IdentityVerification"("creatorId");

-- CreateIndex
CREATE INDEX "IdentityVerification_status_idx" ON "IdentityVerification"("status");

-- CreateIndex
CREATE INDEX "EmailLog_recipientId_emailType_idx" ON "EmailLog"("recipientId", "emailType");

-- CreateIndex
CREATE INDEX "EmailLog_status_createdAt_idx" ON "EmailLog"("status", "createdAt");

-- CreateIndex
CREATE INDEX "EmailLog_toEmail_idx" ON "EmailLog"("toEmail");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorPlan_planType_key" ON "CreatorPlan"("planType");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorSubscription_creatorId_key" ON "CreatorSubscription"("creatorId");

-- CreateIndex
CREATE INDEX "CreatorSubscription_creatorId_idx" ON "CreatorSubscription"("creatorId");

-- CreateIndex
CREATE INDEX "CreatorSubscription_planId_idx" ON "CreatorSubscription"("planId");

-- CreateIndex
CREATE INDEX "CreatorSubscription_status_idx" ON "CreatorSubscription"("status");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualAccount_accountNumber_key" ON "VirtualAccount"("accountNumber");

-- CreateIndex
CREATE INDEX "VirtualAccount_creatorId_idx" ON "VirtualAccount"("creatorId");

-- CreateIndex
CREATE INDEX "VirtualAccount_fanId_idx" ON "VirtualAccount"("fanId");

-- CreateIndex
CREATE INDEX "VirtualAccount_accountNumber_idx" ON "VirtualAccount"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BankTransfer_gmoTransactionId_key" ON "BankTransfer"("gmoTransactionId");

-- CreateIndex
CREATE INDEX "BankTransfer_virtualAccountId_idx" ON "BankTransfer"("virtualAccountId");

-- CreateIndex
CREATE INDEX "BankTransfer_gmoTransactionId_idx" ON "BankTransfer"("gmoTransactionId");

-- CreateIndex
CREATE INDEX "BankTransfer_status_idx" ON "BankTransfer"("status");

-- CreateIndex
CREATE INDEX "BankTransfer_transferDate_idx" ON "BankTransfer"("transferDate");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanProfile" ADD CONSTRAINT "FanProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanProfile" ADD CONSTRAINT "FanProfile_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorProfile" ADD CONSTRAINT "CreatorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPlan" ADD CONSTRAINT "SubscriptionPlan_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "FanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "FanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_requiredPlanId_fkey" FOREIGN KEY ("requiredPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPost" ADD CONSTRAINT "SavedPost_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "FanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPost" ADD CONSTRAINT "SavedPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChargeRequest" ADD CONSTRAINT "ChargeRequest_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "FanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditHistory" ADD CONSTRAINT "CreditHistory_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "FanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityVerification" ADD CONSTRAINT "IdentityVerification_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorSubscription" ADD CONSTRAINT "CreatorSubscription_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorSubscription" ADD CONSTRAINT "CreatorSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "CreatorPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualAccount" ADD CONSTRAINT "VirtualAccount_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualAccount" ADD CONSTRAINT "VirtualAccount_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "FanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransfer" ADD CONSTRAINT "BankTransfer_virtualAccountId_fkey" FOREIGN KEY ("virtualAccountId") REFERENCES "VirtualAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransfer" ADD CONSTRAINT "BankTransfer_creatorSubscriptionId_fkey" FOREIGN KEY ("creatorSubscriptionId") REFERENCES "CreatorSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransfer" ADD CONSTRAINT "BankTransfer_chargeRequestId_fkey" FOREIGN KEY ("chargeRequestId") REFERENCES "ChargeRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

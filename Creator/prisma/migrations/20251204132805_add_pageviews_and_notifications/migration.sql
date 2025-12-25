-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PURCHASE', 'ANNOUNCEMENT', 'PAYMENT_REMINDER', 'SUBSCRIBER', 'COMMENT');

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

-- CreateIndex
CREATE INDEX "PageView_creatorId_viewedAt_idx" ON "PageView"("creatorId", "viewedAt");

-- CreateIndex
CREATE INDEX "PageView_creatorId_path_idx" ON "PageView"("creatorId", "path");

-- CreateIndex
CREATE INDEX "Notification_creatorId_isRead_idx" ON "Notification"("creatorId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_creatorId_createdAt_idx" ON "Notification"("creatorId", "createdAt");

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

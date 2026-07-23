-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "price" INTEGER;

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

-- CreateIndex
CREATE INDEX "Purchase_fanId_idx" ON "Purchase"("fanId");

-- CreateIndex
CREATE INDEX "Purchase_postId_idx" ON "Purchase"("postId");

-- CreateIndex
CREATE INDEX "Purchase_fanId_purchasedAt_idx" ON "Purchase"("fanId", "purchasedAt");

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "FanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

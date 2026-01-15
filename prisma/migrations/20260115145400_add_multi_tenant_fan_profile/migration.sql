-- AlterTable: FanProfile - Add creatorId for multi-tenant support
-- Add creatorId column
ALTER TABLE "FanProfile" ADD COLUMN "creatorId" TEXT NOT NULL;

-- Add foreign key constraint
ALTER TABLE "FanProfile" ADD CONSTRAINT "FanProfile_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add composite unique constraint
ALTER TABLE "FanProfile" ADD CONSTRAINT "FanProfile_userId_creatorId_key" UNIQUE ("userId", "creatorId");

-- Add index on creatorId
CREATE INDEX "FanProfile_creatorId_idx" ON "FanProfile"("creatorId");


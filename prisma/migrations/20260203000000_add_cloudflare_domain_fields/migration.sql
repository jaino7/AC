-- AlterTable
ALTER TABLE "Domain"
ADD COLUMN IF NOT EXISTS "cloudflareHostnameId" TEXT,
ADD COLUMN IF NOT EXISTS "sslValidationRecords" JSONB,
ADD COLUMN IF NOT EXISTS "sslStatus" TEXT,
ADD COLUMN IF NOT EXISTS "lastError" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Domain_cloudflareHostnameId_key" ON "Domain"("cloudflareHostnameId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Domain_cloudflareHostnameId_idx" ON "Domain"("cloudflareHostnameId");

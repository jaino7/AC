-- Add isAdultContent flag to Post table
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "isAdultContent" BOOLEAN NOT NULL DEFAULT false;

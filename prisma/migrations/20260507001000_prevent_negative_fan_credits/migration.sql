UPDATE "FanProfile"
SET "credits" = 0
WHERE "credits" < 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'FanProfile_credits_non_negative_check'
  ) THEN
    ALTER TABLE "FanProfile"
    ADD CONSTRAINT "FanProfile_credits_non_negative_check"
    CHECK ("credits" >= 0);
  END IF;
END $$;

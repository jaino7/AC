-- AlterTable: frontImageKey を nullable に変更（画像削除後はnullになる）
ALTER TABLE "IdentityVerification" ALTER COLUMN "frontImageKey" DROP NOT NULL;

-- AddColumn: 本人確認承認日時
ALTER TABLE "IdentityVerification" ADD COLUMN "verifiedAt" TIMESTAMP(3);

-- AddColumn: 書類画像削除日時
ALTER TABLE "IdentityVerification" ADD COLUMN "documentPurgedAt" TIMESTAMP(3);

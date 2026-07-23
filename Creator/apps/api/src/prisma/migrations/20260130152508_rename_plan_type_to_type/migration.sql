/*
  Warnings:

  - You are about to drop the column `planType` on the `CreatorPlan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[type]` on the table `CreatorPlan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `CreatorPlan` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CreatorPlan_planType_key";

-- AlterTable
ALTER TABLE "CreatorPlan" DROP COLUMN "planType",
ADD COLUMN     "type" "CreatorPlanType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CreatorPlan_type_key" ON "CreatorPlan"("type");

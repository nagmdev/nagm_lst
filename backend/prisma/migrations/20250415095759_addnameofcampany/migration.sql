/*
  Warnings:

  - You are about to drop the column `companyId` on the `Question` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,companyId]` on the table `LeadershipPrinciple` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_leadershipPrincipleName_fkey";

-- DropIndex
DROP INDEX "LeadershipPrinciple_name_key";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "companyId",
ADD COLUMN     "companyName" TEXT,
ALTER COLUMN "leadershipPrincipleName" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LeadershipPrinciple_name_companyId_key" ON "LeadershipPrinciple"("name", "companyId");

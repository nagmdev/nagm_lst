/*
  Warnings:

  - You are about to drop the column `companyId` on the `LeadershipPrinciple` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `leadershipPrincipleId` on the `Question` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `LeadershipPrinciple` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyName` to the `LeadershipPrinciple` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leadershipPrincipleName` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LeadershipPrinciple" DROP CONSTRAINT "LeadershipPrinciple_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_leadershipPrincipleId_fkey";

-- AlterTable
ALTER TABLE "LeadershipPrinciple" DROP COLUMN "companyId",
ADD COLUMN     "companyName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "companyId",
DROP COLUMN "leadershipPrincipleId",
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "leadershipPrincipleName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LeadershipPrinciple_name_key" ON "LeadershipPrinciple"("name");

-- AddForeignKey
ALTER TABLE "LeadershipPrinciple" ADD CONSTRAINT "LeadershipPrinciple_companyName_fkey" FOREIGN KEY ("companyName") REFERENCES "Company"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_companyName_fkey" FOREIGN KEY ("companyName") REFERENCES "Company"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_leadershipPrincipleName_fkey" FOREIGN KEY ("leadershipPrincipleName") REFERENCES "LeadershipPrinciple"("name") ON DELETE CASCADE ON UPDATE CASCADE;

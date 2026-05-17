/*
  Warnings:

  - You are about to drop the column `companyName` on the `LeadershipPrinciple` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `Question` table. All the data in the column will be lost.
  - Added the required column `companyId` to the `LeadershipPrinciple` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LeadershipPrinciple" DROP CONSTRAINT "LeadershipPrinciple_companyName_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_companyName_fkey";

-- DropIndex
DROP INDEX "Company_name_key";

-- AlterTable
ALTER TABLE "LeadershipPrinciple" DROP COLUMN "companyName",
ADD COLUMN     "companyId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "companyName",
ADD COLUMN     "companyId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "LeadershipPrinciple" ADD CONSTRAINT "LeadershipPrinciple_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

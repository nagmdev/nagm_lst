/*
  Warnings:

  - A unique constraint covering the columns `[text,companyId]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_leadershipPrincipleId_fkey";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "companyId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Question_text_companyId_key" ON "Question"("text", "companyId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_leadershipPrincipleId_fkey" FOREIGN KEY ("leadershipPrincipleId") REFERENCES "LeadershipPrinciple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

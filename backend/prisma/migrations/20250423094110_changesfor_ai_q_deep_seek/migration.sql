/*
  Warnings:

  - You are about to drop the `Prompt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Response` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `watinglist` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[deepSeekInteractionId]` on the table `Question` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_promptId_fkey";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "deepSeekInteractionId" INTEGER;

-- DropTable
DROP TABLE "Prompt";

-- DropTable
DROP TABLE "Response";

-- DropTable
DROP TABLE "watinglist";

-- CreateTable
CREATE TABLE "QuestionType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeepSeekInteraction" (
    "id" SERIAL NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "questionId" INTEGER,
    "questionTypeId" INTEGER,
    "positionId" INTEGER,
    "companyId" INTEGER,
    "leadershipPrincipleId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeepSeekInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitingList" (
    "id" SERIAL NOT NULL,
    "isWaiting" BOOLEAN NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaitingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_QuestionToQuestionType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_QuestionToQuestionType_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionType_name_key" ON "QuestionType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DeepSeekInteraction_questionId_key" ON "DeepSeekInteraction"("questionId");

-- CreateIndex
CREATE INDEX "_QuestionToQuestionType_B_index" ON "_QuestionToQuestionType"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Question_deepSeekInteractionId_key" ON "Question"("deepSeekInteractionId");

-- AddForeignKey
ALTER TABLE "DeepSeekInteraction" ADD CONSTRAINT "DeepSeekInteraction_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "QuestionType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeepSeekInteraction" ADD CONSTRAINT "DeepSeekInteraction_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeepSeekInteraction" ADD CONSTRAINT "DeepSeekInteraction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeepSeekInteraction" ADD CONSTRAINT "DeepSeekInteraction_leadershipPrincipleId_fkey" FOREIGN KEY ("leadershipPrincipleId") REFERENCES "LeadershipPrinciple"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_deepSeekInteractionId_fkey" FOREIGN KEY ("deepSeekInteractionId") REFERENCES "DeepSeekInteraction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionToQuestionType" ADD CONSTRAINT "_QuestionToQuestionType_A_fkey" FOREIGN KEY ("A") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionToQuestionType" ADD CONSTRAINT "_QuestionToQuestionType_B_fkey" FOREIGN KEY ("B") REFERENCES "QuestionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

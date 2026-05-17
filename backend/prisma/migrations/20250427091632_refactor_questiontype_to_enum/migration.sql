/*
  Warnings:

  - You are about to drop the column `questionTypeId` on the `DeepSeekInteraction` table. All the data in the column will be lost.
  - You are about to drop the `QuestionType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_QuestionToQuestionType` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "QuestionTypeEnum" AS ENUM ('BEHAVIORAL', 'SITUATIONAL', 'TECHNICAL', 'COMPETENCY_BASED', 'PROBLEM_SOLVING', 'PERSONAL', 'CASE_STUDY');

-- DropForeignKey
ALTER TABLE "DeepSeekInteraction" DROP CONSTRAINT "DeepSeekInteraction_questionTypeId_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionToQuestionType" DROP CONSTRAINT "_QuestionToQuestionType_A_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionToQuestionType" DROP CONSTRAINT "_QuestionToQuestionType_B_fkey";

-- AlterTable
ALTER TABLE "DeepSeekInteraction" DROP COLUMN "questionTypeId",
ADD COLUMN     "questionType" "QuestionTypeEnum";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "questionType" "QuestionTypeEnum" NOT NULL DEFAULT 'BEHAVIORAL';

-- AlterTable
ALTER TABLE "WaitingList" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "QuestionType";

-- DropTable
DROP TABLE "_QuestionToQuestionType";

/*
  Warnings:

  - The values [SITUATIONAL,COMPETENCY_BASED,PERSONAL] on the enum `QuestionTypeEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuestionTypeEnum_new" AS ENUM ('BEHAVIORAL', 'SYSTEM_DESIGN', 'TECHNICAL', 'DATA_STRUCTURE', 'ALGORITHMS', 'PROBLEM_SOLVING', 'CASE_STUDY');
ALTER TABLE "Question" ALTER COLUMN "questionType" DROP DEFAULT;
ALTER TABLE "Question" ALTER COLUMN "questionType" TYPE "QuestionTypeEnum_new" USING ("questionType"::text::"QuestionTypeEnum_new");
ALTER TABLE "DeepSeekInteraction" ALTER COLUMN "questionType" TYPE "QuestionTypeEnum_new" USING ("questionType"::text::"QuestionTypeEnum_new");
ALTER TYPE "QuestionTypeEnum" RENAME TO "QuestionTypeEnum_old";
ALTER TYPE "QuestionTypeEnum_new" RENAME TO "QuestionTypeEnum";
DROP TYPE "QuestionTypeEnum_old";
ALTER TABLE "Question" ALTER COLUMN "questionType" SET DEFAULT 'BEHAVIORAL';
COMMIT;

-- CreateTable
CREATE TABLE "ATSResult" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "cvPath" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "atsScore" DOUBLE PRECISION NOT NULL,
    "recommendations" TEXT NOT NULL,
    "pass" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ATSResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ATSResult" ADD CONSTRAINT "ATSResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

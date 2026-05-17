-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "cvUrl" TEXT,
ALTER COLUMN "text" DROP NOT NULL;

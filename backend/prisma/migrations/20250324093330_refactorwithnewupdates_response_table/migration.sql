/*
  Warnings:

  - You are about to drop the column `cvUrl` on the `Prompt` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Prompt" DROP COLUMN "cvUrl",
ADD COLUMN     "cvPath" TEXT;

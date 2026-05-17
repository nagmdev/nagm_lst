-- AlterTable
ALTER TABLE "ATSResult" ADD COLUMN     "cvText" TEXT,
ADD COLUMN     "fullReportJson" TEXT,
ADD COLUMN     "jobId" INTEGER;

-- AddForeignKey
ALTER TABLE "ATSResult" ADD CONSTRAINT "ATSResult_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Manually added migration to keep history in sync with prisma db push.
-- Ensures applications are deleted when their parent job is removed.

ALTER TABLE "Application" DROP CONSTRAINT IF EXISTS "Application_jobId_fkey";

ALTER TABLE "Application"
  ADD CONSTRAINT "Application_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "Job"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;


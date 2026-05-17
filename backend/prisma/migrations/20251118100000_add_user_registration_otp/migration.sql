-- Create enum for user status
DO $$ BEGIN
  CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add registration OTP-related columns to User
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS "otpCode" TEXT,
ADD COLUMN IF NOT EXISTS "otpExpiresAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "lastOtpSentAt" TIMESTAMP(3);



-- Add reset OTP and verification columns to User table

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "resetOtp" TEXT,
ADD COLUMN IF NOT EXISTS "resetOtpExpires" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "verificationToken" TEXT,
ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT FALSE;


-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Review" ADD COLUMN "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Review" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Review" ADD COLUMN "moderatedBy" TEXT;
ALTER TABLE "Review" ADD COLUMN "moderatedAt" TIMESTAMP(3);

-- Backfill default values for existing rows
UPDATE "Review" SET "status" = 'APPROVED' WHERE "status" IS NULL;

-- CreateEnum
CREATE TYPE "public"."ContestStatus" AS ENUM ('ACTIVE', 'ENDED', 'UPCOMING');

-- AlterTable
ALTER TABLE "public"."Contest" ADD COLUMN     "status" "public"."ContestStatus" NOT NULL DEFAULT 'UPCOMING';

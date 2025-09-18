/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contestId,index]` on the table `Challenge` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endTime` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notionDocId` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Challenge" ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notionDocId" TEXT NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "password";

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_contestId_index_key" ON "public"."Challenge"("contestId", "index");

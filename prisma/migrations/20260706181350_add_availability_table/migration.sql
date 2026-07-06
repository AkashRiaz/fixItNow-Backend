/*
  Warnings:

  - You are about to drop the column `isAvailable` on the `technicianProfiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "technicianProfiles" DROP COLUMN "isAvailable";

-- CreateTable
CREATE TABLE "availabilities" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availabilities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicianProfiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

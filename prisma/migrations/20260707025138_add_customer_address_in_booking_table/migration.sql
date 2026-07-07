/*
  Warnings:

  - Added the required column `customerAddress` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "customerAddress" TEXT NOT NULL;

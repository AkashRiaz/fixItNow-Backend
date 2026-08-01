-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "slotEnd" TIMESTAMP(3),
ADD COLUMN     "slotStart" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "technicianProfiles" ADD COLUMN     "profilePhoto" TEXT;

-- CreateIndex
CREATE INDEX "availabilities_technicianId_dayOfWeek_idx" ON "availabilities"("technicianId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "bookings_technicianId_slotStart_slotEnd_idx" ON "bookings"("technicianId", "slotStart", "slotEnd");

-- CreateIndex
CREATE INDEX "bookings_customerId_slotStart_idx" ON "bookings"("customerId", "slotStart");

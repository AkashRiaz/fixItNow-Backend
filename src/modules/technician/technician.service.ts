import { prisma } from "../../lib/prisma";
import {
  ITechnicianAvailabilityPayload,
  ITechnicianUpdatePayload,
} from "./technician.interface";

const updateTechnicianProfile = async (
  userId: string,
  payload: ITechnicianUpdatePayload,
) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!technicianProfile) {
    throw new Error("Technician profile not found.");
  }

  const updatedProfile = await prisma.technicianProfile.update({
    where: {
      userId,
    },
    data: payload,
  });

  return updatedProfile;
};

const updateTechnicianAvailability = async (
  userId: string,
  payload: ITechnicianAvailabilityPayload[],
) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!technicianProfile) {
    throw new Error("Technician profile not found.");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.availability.deleteMany({
      where: {
        technicianId: technicianProfile.id,
      },
    });

    // Insert new availability
    await tx.availability.createMany({
      data: payload.map((slot) => ({
        technicianId: technicianProfile.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    });

    return await tx.availability.findMany({
      where: {
        technicianId: technicianProfile.id,
      },
    });
  });

  return result;
};

export const technicianService = {
  updateTechnicianProfile,
  updateTechnicianAvailability,
};

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

const getAllTechnicians = async () => {
  const technicians = await prisma.technicianProfile.findMany({
    include: {
      user: true,
      availability: true,
      reviews: true,
    },
  });

  return technicians;
};

const getTechnicianById = async (technicianId: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      id: technicianId,
    },
    include: {
      reviews: true,
    },
  });

  return technician;
};

const getTechnicianBookings = async (userId: string) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });
  const bookings = await prisma.booking.findMany({
    where: {
      technicianId: technicianProfile?.id,
    },
    include: {
      service: true,
      customer: {
        omit: {
          password: true,
        },
      },
      technician: {
        include: {
          user: true,
        },
      }
    },
  });
  return bookings;
};

export const technicianService = {
  updateTechnicianProfile,
  updateTechnicianAvailability,
  getAllTechnicians,
  getTechnicianById,
  getTechnicianBookings,
};

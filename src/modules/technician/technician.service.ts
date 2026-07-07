import { BookingStatus, UserStatus } from "../../../generated/prisma/enums";
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
      },
    },
  });
  return bookings;
};

const updateBookingStatus = async (
  userId: string,
  bookingId: string,
  status: BookingStatus,
) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!technicianProfile) {
    throw new Error("Technician profile not found");
  }

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });
  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.technicianId !== technicianProfile.id) {
    throw new Error("You are not authorized to update this booking");
  }

  // Allowed status transitions
  const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
    REQUESTED: [BookingStatus.ACCEPTED, BookingStatus.DECLINED],
    ACCEPTED: [],
    PAID: [BookingStatus.IN_PROGRESS],
    IN_PROGRESS: [BookingStatus.COMPLETED],
    COMPLETED: [],
    DECLINED: [],
    CANCELLED: [],
  };

  if (!allowedTransitions[booking.status].includes(status)) {
    throw new Error(
      `Cannot change booking status from ${booking.status} to ${status}.`,
    );
  }

  const updatedBooking = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status,
      },
    });

    if (status === BookingStatus.COMPLETED) {
      await tx.technicianProfile.update({
        where: {
          id: technicianProfile.id,
        },
        data: {
          completedJobs: {
            increment: 1,
          },
        },
      });
    }

    return booking;
  });

  return updatedBooking;
};

export const technicianService = {
  updateTechnicianProfile,
  updateTechnicianAvailability,
  getAllTechnicians,
  getTechnicianById,
  getTechnicianBookings,
  updateBookingStatus,
};

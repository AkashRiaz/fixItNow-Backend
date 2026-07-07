import { Prisma } from "../../../generated/prisma/browser";
import { BookingStatus, UserStatus } from "../../../generated/prisma/enums";
import { TechnicianProfileWhereInput } from "../../../generated/prisma/models";
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

const getAllTechnicians = async (query: any) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: TechnicianProfileWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          user: {
            name: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          bio: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          location: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          hourlyRate: {
            equals: Number(query.searchTerm),
          },
        },
        {
          experience: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.location) {
    andConditions.push({
      location: {
        equals: query.location,
        mode: "insensitive",
      },
    });
  }
  if (query.status) {
    andConditions.push({
      user: {
        status: query.status as UserStatus,
      },
    });
  }

  if (query.minHourlyRate || query.maxHourlyRate) {
    const hourlyRateFilter: Prisma.FloatFilter = {};

    if (query.minHourlyRate) {
      hourlyRateFilter.gte = Number(query.minHourlyRate);
    }

    if (query.maxHourlyRate) {
      hourlyRateFilter.lte = Number(query.maxHourlyRate);
    }

    andConditions.push({
      hourlyRate: hourlyRateFilter,
    });
  }

  const whereConditions: Prisma.TechnicianProfileWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const total = await prisma.technicianProfile.count({
    where: whereConditions,
  });

  const technicians = await prisma.technicianProfile.findMany({
    where: whereConditions,
    take: limit,
    skip: skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      user: true,
      availability: true,
      reviews: true,
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: technicians,
  };
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

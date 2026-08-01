import httpStatus from "http-status";
import { Prisma } from "../../../generated/prisma/browser";
import {
  BookingStatus,
  PaymentStatus,
  UserStatus,
} from "../../../generated/prisma/enums";
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
    data: {
      ...(payload.bio !== undefined && {
        bio: payload.bio?.trim() || null,
      }),

      ...(payload.experience !== undefined && {
        experience: payload.experience.trim(),
      }),

      ...(payload.location !== undefined && {
        location: payload.location.trim(),
      }),

      ...(payload.hourlyRate !== undefined && {
        hourlyRate: Number(payload.hourlyRate),
      }),

      ...(payload.profilePhoto !== undefined && {
        profilePhoto: payload.profilePhoto.trim() || null,
      }),
    },
    include: {
      user: {
        omit: {
          password: true,
        },
      },
      availability: true,
    },
  });

  return updatedProfile;
};

const getTechnicianAvailability = async (userId: string) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!technicianProfile) {
    throw new Error("Technician profile not found.");
  }

  const availability = await prisma.availability.findMany({
    where: {
      technicianId: technicianProfile.id,
    },
    orderBy: [
      {
        dayOfWeek: "asc",
      },
      {
        startTime: "asc",
      },
    ],
  });

  return availability;
};

const updateTechnicianAvailability = async (
  userId: string,
  payload: ITechnicianAvailabilityPayload[],
) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!technicianProfile) {
    throw new Error("Technician profile not found.");
  }

  if (!Array.isArray(payload)) {
    throw new Error("Availability must be provided as an array.");
  }

  const availabilityData = payload.map((slot) => {
    const dayOfWeek = Number(slot.dayOfWeek);
    const startTime = new Date(slot.startTime);
    const endTime = new Date(slot.endTime);

    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error("Day of week must be between 0 and 6.");
    }

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      throw new Error("Invalid availability start or end time.");
    }

    if (startTime >= endTime) {
      throw new Error("Availability end time must be after start time.");
    }

    return {
      technicianId: technicianProfile.id,
      dayOfWeek,
      startTime,
      endTime,
    };
  });

  const result = await prisma.$transaction(async (tx) => {
    await tx.availability.deleteMany({
      where: {
        technicianId: technicianProfile.id,
      },
    });

    if (availabilityData.length > 0) {
      await tx.availability.createMany({
        data: availabilityData,
      });
    }

    return tx.availability.findMany({
      where: {
        technicianId: technicianProfile.id,
      },
      orderBy: [
        {
          dayOfWeek: "asc",
        },
        {
          startTime: "asc",
        },
      ],
    });
  });

  return result;
};

const getAllTechnicians = async (query: any) => {
  const limit = query.limit ? Number(query.limit) : 3;
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
      user: {
        omit: {
          password: true,
        },
      },
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
      user: {
        omit: {
          password: true,
        },
      },

      reviews: {
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },

      services: {
        include: {
          category: true,
        },
      },

      availability: {
        orderBy: {
          dayOfWeek: "asc",
        },
      },
    },
  });

  if (!technician) {
    throw new Error("Technician not found");
  }

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
          user: {
            omit: {
              password: true,
            },
          },
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

const getTechnicianDashboard = async (userId: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
      userId: true,
      completedJobs: true,
    },
  });

  if (!technician) {
    throw new Error("Technician profile not found");
  }

  const technicianId = technician.id;
  const currentDate = new Date();

  const [
    pendingRequests,
    upcomingJobs,
    completedJobs,
    earningsResult,
    upcomingBookings,
    pendingBookings,
    recentPayments,
  ] = await prisma.$transaction([
    prisma.booking.count({
      where: {
        technicianId,
        status: BookingStatus.REQUESTED,
      },
    }),

    prisma.booking.count({
      where: {
        technicianId,
        bookingDate: {
          gte: currentDate,
        },
        status: {
          in: [
            BookingStatus.ACCEPTED,
            BookingStatus.PAID,
            BookingStatus.IN_PROGRESS,
          ],
        },
      },
    }),

    prisma.booking.count({
      where: {
        technicianId,
        status: BookingStatus.COMPLETED,
      },
    }),

    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.COMPLETED,
        booking: {
          technicianId,
          status: BookingStatus.COMPLETED,
        },
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.booking.findMany({
      where: {
        technicianId,
        bookingDate: {
          gte: currentDate,
        },
        status: {
          in: [
            BookingStatus.ACCEPTED,
            BookingStatus.PAID,
            BookingStatus.IN_PROGRESS,
          ],
        },
      },
      orderBy: {
        bookingDate: "asc",
      },
      take: 5,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            duration: true,
            price: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    }),

    prisma.booking.findMany({
      where: {
        technicianId,
        status: BookingStatus.REQUESTED,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            duration: true,
            price: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    }),

    prisma.payment.findMany({
      where: {
        status: PaymentStatus.COMPLETED,
        booking: {
          technicianId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        booking: {
          select: {
            id: true,
            bookingDate: true,
            status: true,
            service: {
              select: {
                id: true,
                title: true,
              },
            },
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    summary: {
      upcomingJobs,
      totalEarnings: earningsResult._sum.amount || 0,
      pendingRequests,
      completedJobs,
    },
    upcomingBookings,
    pendingBookings,
    recentPayments,
  };
};

export const technicianService = {
  updateTechnicianProfile,
  getTechnicianAvailability,
  updateTechnicianAvailability,
  getAllTechnicians,
  getTechnicianById,
  getTechnicianBookings,
  updateBookingStatus,
  getTechnicianDashboard,
};

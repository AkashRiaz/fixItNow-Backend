import { Prisma } from "../../../generated/prisma/client";
import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IBookingCreatePayload } from "./booking.interface";

const activeBookingStatuses: BookingStatus[] = [
  BookingStatus.REQUESTED,
  BookingStatus.ACCEPTED,
  BookingStatus.PAID,
  BookingStatus.IN_PROGRESS,
];

const getTimeInMinutes = (date: Date) => {
  return date.getUTCHours() * 60 + date.getUTCMinutes();
};

const getCurrentDhakaWallClockAsUTC = () => {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(now);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return new Date(
    Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute),
      Number(values.second),
    ),
  );
};

const createBooking = async (
  userId: string,
  payload: IBookingCreatePayload,
) => {
  const slotStart = new Date(payload.slotStart);
  const slotEnd = new Date(payload.slotEnd);

  if (Number.isNaN(slotStart.getTime()) || Number.isNaN(slotEnd.getTime())) {
    throw new Error("Invalid booking date or time");
  }

  if (slotStart >= slotEnd) {
    throw new Error("End time must be after start time");
  }

  const currentDhakaTime = getCurrentDhakaWallClockAsUTC();

  if (slotStart <= currentDhakaTime) {
    throw new Error("Booking time must be in the future");
  }

  if (!payload.customerAddress?.trim()) {
    throw new Error("Customer address is required");
  }

  if (!payload.serviceId?.trim()) {
    throw new Error("Service ID is required");
  }

  const service = await prisma.service.findUnique({
    where: {
      id: payload.serviceId,
    },

    include: {
      technician: {
        include: {
          availability: {
            orderBy: [
              {
                dayOfWeek: "asc",
              },
              {
                startTime: "asc",
              },
            ],
          },
        },
      },
    },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  const selectedDay = slotStart.getUTCDay();

  const selectedDayAvailability = service.technician.availability.filter(
    (availability) => availability.dayOfWeek === selectedDay,
  );

  if (!selectedDayAvailability.length) {
    throw new Error("Technician is not available on the selected day");
  }

  const requestedStartMinutes = getTimeInMinutes(slotStart);

  const requestedEndMinutes = getTimeInMinutes(slotEnd);

  const matchingAvailability = selectedDayAvailability.find((availability) => {
    const availabilityStart = new Date(availability.startTime);

    const availabilityEnd = new Date(availability.endTime);

    const availableStartMinutes = getTimeInMinutes(availabilityStart);

    const availableEndMinutes = getTimeInMinutes(availabilityEnd);

    return (
      requestedStartMinutes >= availableStartMinutes &&
      requestedEndMinutes <= availableEndMinutes
    );
  });

  if (!matchingAvailability) {
    throw new Error("Selected time is outside the technician availability");
  }

  const booking = await prisma.$transaction(
    async (tx) => {
      const conflictingBooking = await tx.booking.findFirst({
        where: {
          technicianId: service.technicianId,

          status: {
            in: activeBookingStatuses,
          },

          slotStart: {
            lt: slotEnd,
          },

          slotEnd: {
            gt: slotStart,
          },
        },

        select: {
          id: true,
          slotStart: true,
          slotEnd: true,
        },
      });

      if (conflictingBooking) {
        throw new Error(
          "This technician is already booked during the selected time",
        );
      }

      return tx.booking.create({
        data: {
          bookingDate: slotStart,
          slotStart,
          slotEnd,

          notes: payload.notes?.trim() || null,

          customerAddress: payload.customerAddress.trim(),

          customerId: userId,
          serviceId: service.id,
          technicianId: service.technicianId,
          totalPrice: service.price,
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

              availability: true,
            },
          },

          payment: true,
          review: true,
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );

  return booking;
};

const getAllBookings = async (userId: string) => {
  const bookings = await prisma.booking.findMany({
    where: {
      customerId: userId,
    },
    include: {
      service: true,
      technician: {
        include: {
          user: {
            omit: {
              password: true,
            },
          },
        },
      },
      customer: {
        omit: {
          password: true,
        },
      },
    },
  });

  return bookings;
};

const getBookingById = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
      customerId: userId,
    },
    include: {
      customer: true,
      service: true,
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

  if (!booking) {
    throw new Error("Booking not found");
  }

  return booking;
};

const cancelBooking = async (bookingId: string, userId: string) => {
  return prisma.$transaction(
    async (tx) => {
      const booking = await tx.booking.findFirst({
        where: {
          id: bookingId,
          customerId: userId,
        },
        select: {
          id: true,
          status: true,
          payment: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      const cancellableStatuses: BookingStatus[] = [
        BookingStatus.REQUESTED,
        BookingStatus.ACCEPTED,
      ];

      if (!cancellableStatuses.includes(booking.status)) {
        throw new Error("Only requested or accepted bookings can be cancelled");
      }

      if (booking.payment?.status === "COMPLETED") {
        throw new Error("Paid bookings cannot be cancelled");
      }

      return tx.booking.update({
        where: {
          id: booking.id,
        },
        data: {
          status: BookingStatus.CANCELLED,
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

          payment: true,
          review: true,
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
};

export const bookingService = {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking,
};

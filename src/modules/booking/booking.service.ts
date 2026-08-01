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
  return date.getHours() * 60 + date.getMinutes();
};

const createBooking = async (
  userId: string,
  payload: IBookingCreatePayload,
) => {
  const slotStart = new Date(payload.slotStart);
  const slotEnd = new Date(payload.slotEnd);

  if (
    Number.isNaN(slotStart.getTime()) ||
    Number.isNaN(slotEnd.getTime())
  ) {
    throw new Error("Invalid booking date or time");
  }

  if (slotStart >= slotEnd) {
    throw new Error("End time must be after start time");
  }

  if (slotStart <= new Date()) {
    throw new Error("Booking time must be in the future");
  }

  const service = await prisma.service.findUnique({
    where: {
      id: payload.serviceId,
    },
    include: {
      technician: {
        include: {
          availability: true,
        },
      },
    },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  const selectedDay = slotStart.getDay();

  const selectedDayAvailability =
    service.technician.availability.filter(
      (availability) =>
        availability.dayOfWeek === selectedDay,
    );

  if (!selectedDayAvailability.length) {
    throw new Error(
      "Technician is not available on the selected day",
    );
  }

  const requestedStartMinutes =
    getTimeInMinutes(slotStart);

  const requestedEndMinutes =
    getTimeInMinutes(slotEnd);

  const isInsideAvailability =
    selectedDayAvailability.some((availability) => {
      const availabilityStart = new Date(
        availability.startTime,
      );

      const availabilityEnd = new Date(
        availability.endTime,
      );

      const availableStartMinutes =
        getTimeInMinutes(availabilityStart);

      const availableEndMinutes =
        getTimeInMinutes(availabilityEnd);

      return (
        requestedStartMinutes >=
          availableStartMinutes &&
        requestedEndMinutes <=
          availableEndMinutes
      );
    });

  if (!isInsideAvailability) {
    throw new Error(
      "Selected time is outside the technician availability",
    );
  }

  const booking = await prisma.$transaction(
    async (tx) => {
      const conflictingBooking =
        await tx.booking.findFirst({
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
          },
        });

      if (conflictingBooking) {
        throw new Error(
          "This technician is already booked during the selected time",
        );
      }

      return tx.booking.create({
        data: {
          // Existing field stays available
          bookingDate: slotStart,

          // New slot fields
          slotStart,
          slotEnd,

          notes: payload.notes?.trim() || null,
          customerAddress:
            payload.customerAddress.trim(),

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
      isolationLevel:
        Prisma.TransactionIsolationLevel.Serializable,
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

export const bookingService = {
  createBooking,
  getAllBookings,
  getBookingById,
};

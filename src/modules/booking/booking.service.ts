import { prisma } from "../../lib/prisma";
import { IBookingCreatePayload } from "./booking.interface";

const createBooking = async (
  userId: string,
  payload: IBookingCreatePayload,
) => {
  const service = await prisma.service.findUnique({
    where: {
      id: payload.serviceId,
    },
  });

  if (!service) {
    throw new Error("Service not found");
  }
  const booking = await prisma.booking.create({
    data: {
      bookingDate: new Date(payload.bookingDate),
      notes: payload.notes,
      customerAddress: payload.customerAddress,
      customerId: userId,
      serviceId: service.id,
      technicianId: service.technicianId,
      totalPrice: service.price,
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
    },
  });

  return booking;
};

const getAllBookings = async () => {
  const bookings = await prisma.booking.findMany({
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
    },
  });

  return bookings;
};

const getBookingById = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
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

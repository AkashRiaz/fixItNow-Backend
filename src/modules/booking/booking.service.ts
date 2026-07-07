import { prisma } from "../../lib/prisma";
import { IBookingCreatePayload } from "./booking.interface";

const createBooking = async(userId: string, payload:IBookingCreatePayload)=>{
  const booking = await prisma.booking.create({
    data: {
        bookingDate: payload.bookingDate,
        notes: payload.notes,
        customerAddress: payload.customerAddress,
        serviceId: payload.serviceId,
        customerId: userId
    }
  })
}

export const bookingService = {
    createBooking
}
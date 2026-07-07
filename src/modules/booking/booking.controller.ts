import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { bookingService } from "./booking.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createBooking = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const payload = req.body;

    const booking = await bookingService.createBooking(
      userId as string,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Booking created successfully",
      data: booking,
    });
  },
);

const getAllBookings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const bookings = await bookingService.getAllBookings();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Bookings retrieved successfully",
      data: bookings,
    });
  },
);

const getBookingById = catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
  const bookingId = req.params.id;
  const booking = await bookingService.getBookingById(bookingId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking retrieved successfully",
    data: booking,
  });
});

export const bookingController = {
  createBooking,
  getAllBookings,
  getBookingById
};

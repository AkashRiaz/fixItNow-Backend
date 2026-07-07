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

export const bookingController = {
  createBooking,
};

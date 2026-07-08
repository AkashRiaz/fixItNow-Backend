import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";

const createPaymentSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const bookingId = req.body.bookingId;

    const result = await paymentService.createPaymentSession(userId!, bookingId as string);

    sendResponse(res, {
      success: true,
      message: "Payment session created successfully",
      statusCode: 200,
      data: result,
    });
  },
);

export const paymentController = {
  createPaymentSession,
};

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

const handleWebhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const event = req.body as Buffer;

    const signature = req.headers["stripe-signature"] as string;


    console.log("Stripe signature:", signature);
    console.log("Stripe event:", event);



    await paymentService.handleWebhook(
      event,
      signature
    );


    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Webhook triggered successfully",
      data: null,
    });

  }
);


export const paymentController = {
  createPaymentSession,
  handleWebhook,
};

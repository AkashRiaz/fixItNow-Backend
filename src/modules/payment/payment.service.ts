import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { handleCheckoutCompleted, handlePaymentFailed } from "./payment.utils";

const createPaymentSession = async (userId: string, bookingId: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        service: true,
        customer: true,
      },
    });
    if (booking?.customerId !== userId) {
      throw new Error("You are not allowed to pay for this booking");
    }

    if (booking.status !== "ACCEPTED") {
      throw new Error(
        "Payment is only allowed after technician accepts booking",
      );
    }

    const payment = await tx.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.service.price,
        status: "PENDING",
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      customer_email: booking.customer.email,

      line_items: [
        {
          price_data: {
            currency: "BDT",
            product_data: {
              name: booking.service.title,
            },
            unit_amount: booking.totalPrice * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${config.app_url}/payment-success?success=true`,

      cancel_url: `${config.app_url}/payment-cancel?success=false`,

      metadata: {
        paymentId: payment.id,
        bookingId: booking.id,
      },
    });
    return session.url;
  });

  return {
    paymentUrl: transactionResult,
  };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    config.stripe_webhook_secret,
  );

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);

      break;

    case "payment_intent.payment_failed":
      await handlePaymentFailed(event.data.object);

      break;

    default:
      console.log(`No events matched. Unhandled event type ${event.type}`);

      break;
  }
};

export const paymentService = {
  createPaymentSession,
  handleWebhook,
};

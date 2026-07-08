import Stripe from "stripe";
import { prisma } from "../../lib/prisma";

export const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  const paymentId = session?.metadata?.paymentId;
  const bookingId = session?.metadata?.bookingId;

  if (!paymentId || !bookingId) {
    console.log("webhook:: Missing paymentId or bookingId");
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Update payment status

    await tx.payment.update({
      where: {
        id: paymentId,
      },

      data: {
        status: "COMPLETED",
        paidAt: new Date(),
        stripeSessionId: session.id,
        transactionId: session.payment_intent
          ? session.payment_intent.toString()
          : null,
      },
    });

    // Update booking status

    await tx.booking.update({
      where: {
        id: bookingId,
      },

      data: {
        status: "PAID",
      },
    });
  });
};

export const handlePaymentFailed = async (
  paymentIntent: Stripe.PaymentIntent,
) => {
  const paymentId = paymentIntent.metadata?.paymentId;

  if (!paymentId) {
    console.log("Payment id missing");
    return;
  }

  await prisma.payment.update({
    where: {
      id: paymentId,
    },

    data: {
      status: "FAILED",
    },
  });
};

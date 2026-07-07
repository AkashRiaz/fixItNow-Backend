import { prisma } from "../../lib/prisma";
import { IReviewCreatePayload } from "./review.interface";

const createReview = async (userId: string, payload: IReviewCreatePayload) => {
  const { bookingId, rating, comment } = payload;
  //   console.log(bookingId, "booking id")

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.customerId !== userId) {
    throw new Error("You are not authorized to review this booking");
  }

  if (booking.status !== "COMPLETED") {
    throw new Error("You can only review completed bookings");
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      bookingId: bookingId,
    },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this booking");
  }

  return await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        bookingId,
        customerId: userId,
        technicianId: booking.technicianId,
        rating,
        comment,
      },
      include: {
        customer: true,
        technician: {
          include: {
            user: true,
          },
        },
        booking: true,
      },
    });
    const reviews = await tx.review.findMany({
      where: {
        technicianId: booking.technicianId,
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;

    await tx.technicianProfile.update({
      where: {
        id: booking.technicianId,
      },
      data: {
        averageRating: averageRating,
        totalReviews: totalReviews,
      },
    });

    return review;
  });
};

export const reviewService = {
  createReview,
};

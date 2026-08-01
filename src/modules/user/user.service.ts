import { PaymentStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { IUserRegisteredPayload } from "./user.interface";
import bcrypt from "bcryptjs";

const registerUserIntoDB = async (payload: IUserRegisteredPayload) => {
  const { name, email, password, phone, role } = payload;
  const isExistUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (isExistUser) {
    throw new Error("User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        ...(role && { role }),
      },
      omit: {
        password: true,
      },
    });

    if (user.role === "TECHNICIAN") {
      await tx.technicianProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    return user;
  });
  return result;
};

const getCustomerPayments = async (userId: string) => {
  const [payments, totalPaidResult] = await prisma.$transaction([
    prisma.payment.findMany({
      where: {
        booking: {
          customerId: userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        booking: {
          select: {
            id: true,
            bookingDate: true,
            status: true,
            totalPrice: true,

            service: {
              select: {
                id: true,
                title: true,
              },
            },

            technician: {
              select: {
                id: true,

                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    }),

    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.COMPLETED,

        booking: {
          customerId: userId,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  return {
    summary: {
      totalPayments: payments.length,
      totalPaid: totalPaidResult._sum.amount || 0,
    },

    payments,
  };
};

export const userService = {
  registerUserIntoDB,
  getCustomerPayments,
};

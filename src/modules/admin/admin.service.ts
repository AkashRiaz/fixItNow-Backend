import { Prisma } from "../../../generated/prisma/client";
import {
  BookingStatus,
  PaymentStatus,
  Role,
  UserStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
  ICategoryCreatePayload,
  ICategoryUpdatePayload,
} from "./admin.interface";

type UserQuery = {
  searchTerm?: string;
  role?: Role;
  status?: UserStatus;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

const createCategory = async (payload: ICategoryCreatePayload) => {
  const category = await prisma.category.findUnique({
    where: {
      name: payload.name,
    },
  });

  if (category) {
    throw new Error("Category already exists");
  }

  const newCategory = await prisma.category.create({
    data: {
      name: payload.name,
    },
  });

  return newCategory;
};

const getAllCategories = async () => {
  const categories = await prisma.category.findMany();

  return categories;
};

const getAllUsers = async (query: UserQuery) => {
  const page = query?.page ? Number(query.page) : 1;
  const limit = query?.limit ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;

  const allowedSortFields = [
    "name",
    "email",
    "role",
    "status",
    "createdAt",
    "updatedAt",
  ];

  const sortBy =
    query?.sortBy && allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : "createdAt";

  const sortOrder = query?.sortOrder === "asc" ? "asc" : "desc";

  const andConditions: Prisma.UserWhereInput[] = [];

  if (query?.searchTerm) {
    const searchTerm = query.searchTerm.trim();

    if (searchTerm) {
      andConditions.push({
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      });
    }
  }

  if (query?.role) {
    andConditions.push({
      role: query.role,
    });
  }

  if (query?.status) {
    andConditions.push({
      status: query.status,
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const [total, users] = await prisma.$transaction([
    prisma.user.count({
      where: whereConditions,
    }),

    prisma.user.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      omit: {
        password: true,
      },
    }),
  ]);

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateCategory = async (
  categoryId: string,
  payload: ICategoryUpdatePayload,
) => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });
  if (!category) {
    throw new Error("Category not found");
  }
  const updatedCategory = await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      name: payload.name,
    },
  });
  return updatedCategory;
};

const updateUserStatus = async (userId: string, status: UserStatus) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
    data: {
      status: status,
    },
    include: {
      technicianProfile: true,
    },
  });

  return updatedUser;
};

const getAllBookingsForAdmin = async () => {
  const bookings = await prisma.booking.findMany({
    include: {
      service: true,

      customer: {
        omit: {
          password: true,
        },
      },

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

    orderBy: {
      createdAt: "desc",
    },
  });

  return bookings;
};

const getAdminDashboard = async () => {
  const [
    totalUsers,
    totalCustomers,
    totalTechnicians,
    activeUsers,

    requestedBookings,
    acceptedBookings,
    paidBookings,
    inProgressBookings,
    completedBookings,
    cancelledBookings,
    declinedBookings,

    completedPayments,
    pendingPayments,
    failedPayments,
    totalRevenueResult,

    recentBookings,
    recentPayments,
    topTechnicians,
  ] = await prisma.$transaction([
    prisma.user.count(),

    prisma.user.count({
      where: {
        role: Role.CUSTOMER,
      },
    }),

    prisma.user.count({
      where: {
        role: Role.TECHNICIAN,
      },
    }),

    prisma.user.count({
      where: {
        status: UserStatus.ACTIVE,
      },
    }),

    prisma.booking.count({
      where: {
        status: BookingStatus.REQUESTED,
      },
    }),

    prisma.booking.count({
      where: {
        status: BookingStatus.ACCEPTED,
      },
    }),

    prisma.booking.count({
      where: {
        status: BookingStatus.PAID,
      },
    }),

    prisma.booking.count({
      where: {
        status: BookingStatus.IN_PROGRESS,
      },
    }),

    prisma.booking.count({
      where: {
        status: BookingStatus.COMPLETED,
      },
    }),

    prisma.booking.count({
      where: {
        status: BookingStatus.CANCELLED,
      },
    }),

    prisma.booking.count({
      where: {
        status: BookingStatus.DECLINED,
      },
    }),

    prisma.payment.count({
      where: {
        status: PaymentStatus.COMPLETED,
      },
    }),

    prisma.payment.count({
      where: {
        status: PaymentStatus.PENDING,
      },
    }),

    prisma.payment.count({
      where: {
        status: PaymentStatus.FAILED,
      },
    }),

    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.COMPLETED,
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.booking.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        service: {
          select: {
            id: true,
            title: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
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
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
      },
    }),

    prisma.payment.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        booking: {
          select: {
            id: true,
            bookingDate: true,
            status: true,
            service: {
              select: {
                id: true,
                title: true,
              },
            },
            customer: {
              select: {
                id: true,
                name: true,
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

    prisma.technicianProfile.findMany({
      orderBy: [
        {
          averageRating: "desc",
        },
        {
          completedJobs: "desc",
        },
      ],
      take: 5,
      select: {
        id: true,
        averageRating: true,
        totalReviews: true,
        completedJobs: true,
        location: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
      },
    }),
  ]);

  const activeBookings =
    requestedBookings + acceptedBookings + paidBookings + inProgressBookings;

  return {
    summary: {
      totalUsers,
      totalCustomers,
      totalTechnicians,
      activeUsers,
      activeBookings,
      completedBookings,
      totalRevenue: totalRevenueResult._sum.amount || 0,
    },

    bookingStatusSummary: {
      requested: requestedBookings,
      accepted: acceptedBookings,
      paid: paidBookings,
      inProgress: inProgressBookings,
      completed: completedBookings,
      cancelled: cancelledBookings,
      declined: declinedBookings,
    },

    paymentSummary: {
      completedPayments,
      pendingPayments,
      failedPayments,
    },

    recentBookings,
    recentPayments,
    topTechnicians,
  };
};

export const adminService = {
  createCategory,
  getAllCategories,
  getAllUsers,
  updateUserStatus,
  getAllBookingsForAdmin,
  getAdminDashboard,
  updateCategory,
};

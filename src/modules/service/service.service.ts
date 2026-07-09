import { Prisma } from "../../../generated/prisma/browser";
import { ServiceWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IServiceCreatePayload } from "./service.interface";

const createService = async (
  userId: string,
  payload: IServiceCreatePayload,
) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!technicianProfile) {
    throw new Error("Technician profile not found");
  }

  const service = await prisma.service.create({
    data: {
      ...payload,
      technicianId: technicianProfile.id,
    },
    include: {
      category: true,
      technician: true,
    },
  });

  return service;
};

const getAllServices = async (query: any) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: ServiceWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query?.category) {
    andConditions.push({
      category: {
        name: {
          equals: query.category,
          mode: "insensitive",
        },
      },
    });
  }

  if (query.location) {
    andConditions.push({
      technician: {
        location: {
          equals: query.location,
          mode: "insensitive",
        },
      },
    });
  }

  if (query.rating) {
    andConditions.push({
      technician: {
        averageRating: {
          gte: Number(query.rating),
        },
      },
    });
  }

  // Filter by Price Range
  if (query.minPrice || query.maxPrice) {
    const priceFilter: Prisma.FloatFilter = {};

    if (query.minPrice) {
      priceFilter.gte = Number(query.minPrice);
    }

    if (query.maxPrice) {
      priceFilter.lte = Number(query.maxPrice);
    }

    andConditions.push({
      price: priceFilter,
    });
  }

  // Final where condition
  const whereConditions: ServiceWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const total = await prisma.service.count({
    where: whereConditions,
  });

  const services = await prisma.service.findMany({
    where: whereConditions,
    take: limit,
    skip: skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      category: true,
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
  });

  return {
    data: services,
    meta: {
      page,
      limit,
      total,
    },
  };
};

export const serviceService = {
  createService,
  getAllServices,
};

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

const getAllServices = async () => {
  const services = await prisma.service.findMany({
    include: {
      category: true,
      technician: {
        include: {
          user: true,
        },
      },
    },
  });

  return services;
};

export const serviceService = {
  createService,
  getAllServices,
};

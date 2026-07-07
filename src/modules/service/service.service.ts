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
  });

  return service;
};

export const serviceService = {
  createService,
};

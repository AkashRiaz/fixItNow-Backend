import { Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICategoryCreatePayload } from "./admin.interface";

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

const getAllUsers = async () => {
  const users = await prisma.user.findMany();
  return users;
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
    include:{
        technicianProfile: true,
    }
  });

  return updatedUser;
};

export const adminService = {
  createCategory,
  getAllCategories,
  getAllUsers,
  updateUserStatus,
};

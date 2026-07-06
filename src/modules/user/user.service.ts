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

export const userService = {
  registerUserIntoDB,
};

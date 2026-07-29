import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtHelper } from "../../utils/jwt";
import { ILoginPayload } from "./auth.interface";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const loginUser = async (payload: ILoginPayload) => {
  const { email, password } = payload;
  const user = await prisma.user.findFirstOrThrow({
    where: {
      email,
    },
  });

  if (user.status === "BLOCKED") {
    throw new Error(
      "Your account has been blocked. Please contact support for assistance.",
    );
  }
  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error("Password is incorrect. Please try again.");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtHelper.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expiration as SignOptions,
  );

  const refreshToken = jwtHelper.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expiration as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const getLoginUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
    include: {
      technicianProfile: {
        include: {
          availability: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
};

const refreshToken = async (refreshToken: string) => {
  const verifiedRefreshToken = jwtHelper.verifyToken(
    refreshToken,
    config.jwt_refresh_secret,
  );

  if (!verifiedRefreshToken.success) {
    throw new Error("Invalid refresh token. Please log in again.");
  }

  const { id } = verifiedRefreshToken.data as JwtPayload;
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
  });

  if (user.status === "BLOCKED") {
    throw new Error("Your account has been blocked. Please contact support.");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const newAccessToken = jwtHelper.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expiration as SignOptions,
  );

  return {
    accessToken: newAccessToken,
  };
};

export const authService = {
  loginUser,
  getLoginUser,
  refreshToken,
};

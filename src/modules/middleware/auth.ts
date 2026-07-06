import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { jwtHelper } from "../../utils/jwt";
import config from "../../config";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { Role } from "../../../generated/prisma/enums";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new Error(
        "You are not authorized to access this resource. Please login first.",
      );
    }

    const verifiedToken = jwtHelper.verifyToken(
      token,
      config.jwt_access_secret as string,
    );

    if (verifiedToken.success === false) {
      throw new Error("Invalid or expired token. Please login again.");
    }
    const { id, name, email, role } = verifiedToken.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role as Role)) {
      throw new Error(
        "Forbidden! You don't have permission to access this resource."
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
        email,
        name,
        role,
      },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    if (user.status === "BLOCKED") {
      throw new Error(
        "Your account has been blocked. Please contact support for assistance.",
      );
    }

    req.user = {
      id,
      name,
      email,
      role,
    };

    next();
  });
};

import { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

const createToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: SignOptions,
) => {
  const token = jwt.sign(payload, secret, {
    expiresIn: expiresIn,
  } as SignOptions);
  return token;
};

const verifyToken = (token: string, secret: string) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return {
      success: true,
      data: verifiedToken,
    };
  } catch (error) {
    console.log("Token verification failed", error);
    return {
      success: false,
      data: error,
    };
  }
};

export const jwtHelper = {
  createToken,
  verifyToken,
};

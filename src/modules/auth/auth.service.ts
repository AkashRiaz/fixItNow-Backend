import { prisma } from "../../lib/prisma";
import { ILoginPayload } from "./auth.interface";
import bcrypt from "bcryptjs";

const loginUser = async (payload: ILoginPayload) => {
  const { email, password } = payload;
  const user = await prisma.user.findFirstOrThrow({
    where: {
      email,
    },
  });

  if(user.status === "BLOCKED"){
    throw new Error("Your account has been blocked. Please contact support for assistance.");
  }
  const isPasswordMatched =  await bcrypt.compare(password, user.password);

  if(!isPasswordMatched){
    throw new Error("Password is incorrect. Please try again.");
  }

  return user;

};

export const authService = {
  loginUser,
};

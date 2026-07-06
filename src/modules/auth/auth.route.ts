import { Router } from "express";
import { authController } from "./auth.controller";
import { auth } from "../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/login", authController.loginUser);
router.get(
  "/me",
  auth(Role.ADMIN, Role.CUSTOMER, Role.TECHNICIAN),
  authController.getLoginUser,
);

export const authRoute = router;

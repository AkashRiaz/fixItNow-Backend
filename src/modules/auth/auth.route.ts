import { Router } from "express";
import { authController } from "./auth.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/login", authController.loginUser);
router.get(
  "/me",
  auth(Role.ADMIN, Role.CUSTOMER, Role.TECHNICIAN),
  authController.getLoginUser,
);

export const authRoute = router;

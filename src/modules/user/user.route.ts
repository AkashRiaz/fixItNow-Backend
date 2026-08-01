import { Router } from "express";
import { userController } from "./user.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", userController.registerUser);
router.get("/", auth(Role.CUSTOMER), userController.getCustomerPayments);

export const userRoute = router;

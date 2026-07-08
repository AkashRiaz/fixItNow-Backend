import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";

const router = Router();

router.post(
  "/checkout",
  auth(Role.ADMIN, Role.CUSTOMER, Role.TECHNICIAN),
  paymentController.createPaymentSession,
);

export const paymentRoute = router;

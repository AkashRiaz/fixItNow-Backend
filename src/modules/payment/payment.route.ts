import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";

const router = Router();

router.post(
  "/create",
  auth(Role.ADMIN, Role.CUSTOMER, Role.TECHNICIAN),
  paymentController.createPaymentSession,
);

router.post("/webhook", paymentController.handleWebhook);

router.get("/", auth(Role.CUSTOMER), paymentController.userPaymentHistory)

router.get("/:id", auth(Role.CUSTOMER), paymentController.getPaymentById);

export const paymentRoute = router;

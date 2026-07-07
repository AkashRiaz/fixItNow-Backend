import { Router } from "express";
import { bookingController } from "./booking.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.CUSTOMER), bookingController.createBooking);

router.get("/", bookingController.getAllBookings);

router.get("/:id", bookingController.getBookingById);

export const bookingRoute = router;

import { Router } from "express";
import { bookingController } from "./booking.controller";

const router = Router();

router.post("/", bookingController.createBooking);

export const bookingRoute = router;

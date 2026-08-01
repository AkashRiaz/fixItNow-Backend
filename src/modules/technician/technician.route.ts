import { Router } from "express";
import { technicianController } from "./technician.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";

const router = Router();

router.patch(
  "/profile",
  auth(Role.TECHNICIAN),
  technicianController.updateTechnicianProfile,
);

router.get("/", technicianController.getAllTechnicians);

router.get(
  "/bookings",
  auth(Role.TECHNICIAN),
  technicianController.getTechnicianBookings,
);

router.get(
  "/dashboard",
  auth(Role.TECHNICIAN),
  technicianController.getTechnicianDashboard,
);

router.get(
  "/availability",
  auth(Role.TECHNICIAN),
  technicianController.getTechnicianAvailability,
);

router.patch(
  "/availability",
  auth(Role.TECHNICIAN),
  technicianController.updateTechnicianAvailability,
);

router.patch(
  "/bookings/:id",
  auth(Role.TECHNICIAN),
  technicianController.updateBookingStatus,
);

router.get("/:id", technicianController.getTechnicianById);

export const technicianRoute = router;

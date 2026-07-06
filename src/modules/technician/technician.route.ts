import { Router } from "express";
import { technicianController } from "./technician.controller";
import { auth } from "../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.patch(
  "/profile",
  auth(Role.TECHNICIAN),
  technicianController.updateTechnicianProfile,
);

router.patch("/availability", auth(Role.TECHNICIAN), technicianController.updateTechnicianAvailability);

export const technicianRoute = router;

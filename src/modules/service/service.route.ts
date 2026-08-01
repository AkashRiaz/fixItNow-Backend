import { Router } from "express";
import { serviceController } from "./service.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.TECHNICIAN), serviceController.createService);

router.get("/", serviceController.getAllServices);

router.get(
  "/technician-services",
  auth(Role.TECHNICIAN),
  serviceController.getServicesByTechnician,
);

router.patch("/:id", auth(Role.TECHNICIAN), serviceController.updateService);

router.get("/featured", serviceController.getFeaturedServices);

export const serviceRoute = router;

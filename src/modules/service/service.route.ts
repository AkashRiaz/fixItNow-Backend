import { Router } from "express";
import { serviceController } from "./service.controller";

const router = Router();

router.post("/", serviceController.createService);

export const serviceRoute = router;

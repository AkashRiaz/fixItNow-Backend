import { Router } from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/category", auth(Role.ADMIN), adminController.createCategory);

router.get("/categories", auth(Role.ADMIN), adminController.getAllCategories);

router.patch("/category/:id", auth(Role.ADMIN), adminController.updateCategory);

router.get(
  "/bookings",
  auth(Role.ADMIN),
  adminController.getAllBookingsForAdmin,
);

router.get("/dashboard", auth(Role.ADMIN), adminController.getAdminDashboard);

router.get("/users", auth(Role.ADMIN), adminController.getAllUsers);

router.patch("/users/:id", auth(Role.ADMIN), adminController.updateUserStatus);

export const adminRoute = router;

import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRoute } from "./modules/user/user.route";
import { authRoute } from "./modules/auth/auth.route";
import { technicianRoute } from "./modules/technician/technician.route";
import { bookingRoute } from "./modules/booking/booking.route";
import { serviceRoute } from "./modules/service/service.route";
import { adminRoute } from "./modules/admin/admin.route";
import { categoryRoute } from "./modules/category/category.route";
import { reviewRoute } from "./modules/review/review.route";
import { notFound } from "./middleware/notFound";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { paymentRoute } from "./modules/payment/payment.route";

const app: Application = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  }),
);

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/test", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "This is test route",
  });
});

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/technician", technicianRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/service", serviceRoute);
app.use("/api/admin", adminRoute);
app.use("/api/category", categoryRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/payments", paymentRoute);

app.use(notFound);

app.use(globalErrorHandler);

export default app;

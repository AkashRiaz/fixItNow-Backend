import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { technicianService } from "./technician.service";
import { sendResponse } from "../../utils/sendResponse";
import { ITechnicianAvailabilityPayload } from "./technician.interface";

const registerExistingCustomerAsTechnician = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const result = await technicianService.registerExistingCustomerAsTechnician(
      userId as string,
      req.body,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Technician account created successfully",
      data: result,
    });
  },
);

const updateTechnicianProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const payload = req.body;
    const result = await technicianService.updateTechnicianProfile(
      userId as string,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician profile updated successfully",
      data: result,
    });
  },
);

const getTechnicianAvailability = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const result = await technicianService.getTechnicianAvailability(
      userId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician availability retrieved successfully",
      data: result,
    });
  },
);

const updateTechnicianAvailability = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const payload = req.body as ITechnicianAvailabilityPayload[];

    const result = await technicianService.updateTechnicianAvailability(
      userId as string,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician availability saved successfully",
      data: result,
    });
  },
);
const getAllTechnicians = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const technicians = await technicianService.getAllTechnicians(query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technicians retrieved successfully",
      meta: technicians.meta,
      data: technicians.data,
    });
  },
);

const getTechnicianById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const technicianId = req.params.id;
    const technician = await technicianService.getTechnicianById(
      technicianId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician retrieved successfully",
      data: technician,
    });
  },
);

const getTechnicianBookings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const bookings = await technicianService.getTechnicianBookings(
      userId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician bookings retrieved successfully",
      data: bookings,
    });
  },
);

const updateBookingStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const bookingId = req.params.id;
    const { status } = req.body;
    const updatedBooking = await technicianService.updateBookingStatus(
      userId as string,
      bookingId as string,
      status,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Booking status updated successfully",
      data: updatedBooking,
    });
  },
);

const getTechnicianDashboard = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const dashboardData = await technicianService.getTechnicianDashboard(
      userId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician dashboard data retrieved successfully",
      data: dashboardData,
    });
  },
);

export const technicianController = {
  registerExistingCustomerAsTechnician,
  updateTechnicianProfile,
  getTechnicianAvailability,
  updateTechnicianAvailability,
  getTechnicianById,
  getAllTechnicians,
  getTechnicianBookings,
  updateBookingStatus,
  getTechnicianDashboard,
};

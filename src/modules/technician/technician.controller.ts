import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { technicianService } from "./technician.service";
import { sendResponse } from "../../utils/sendResponse";

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

const updateTechnicianAvailability = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const payload = req.body;
    const result = await technicianService.updateTechnicianAvailability(
      userId as string,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician availability updated successfully",
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

const getTechnicianBookings = catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
  const userId = req.user?.id;
  const bookings = await technicianService.getTechnicianBookings(userId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technician bookings retrieved successfully",
    data: bookings,
  });
})

const updateBookingStatus = catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
  const userId = req.user?.id;
  const bookingId = req.params.id;
  const { status } = req.body;
  const updatedBooking = await technicianService.updateBookingStatus(userId as string,bookingId as string, status);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking status updated successfully",
    data: updatedBooking,
  });
})

export const technicianController = {
  updateTechnicianProfile,
  updateTechnicianAvailability,
  getTechnicianById,
  getAllTechnicians,
  getTechnicianBookings,
  updateBookingStatus,
};

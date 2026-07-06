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

export const technicianController = {
  updateTechnicianProfile,
  updateTechnicianAvailability,
};

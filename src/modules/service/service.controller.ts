import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { serviceService } from "./service.service";
import { sendResponse } from "../../utils/sendResponse";

const createService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const payload = req.body;

    const service = await serviceService.createService(
      userId as string,
      payload,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Service created successfully",
      data: service,
    });
  },
);

const getAllServices = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const services = await serviceService.getAllServices(query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Services retrieved successfully",
      meta: services.meta,
      data: services.data,
    });
  },
);

const getFeaturedServices = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const services = await serviceService.getFeaturedServices();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Featured services retrieved successfully",
      data: services,
    });
  },
);

const getServicesByTechnician = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const services = await serviceService.getServicesByTechnician(
      userId as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Services by technician retrieved successfully",
      data: services,
    });
  },
);

const updateService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const serviceId = req.params.id;
    const payload = req.body;
    const updatedService = await serviceService.updateService(
      serviceId as string,
      payload,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Service updated successfully",
      data: updatedService,
    });
  },
);

export const serviceController = {
  createService,
  getAllServices,
  getFeaturedServices,
  getServicesByTechnician,
  updateService,
};

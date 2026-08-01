import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { adminService } from "./admin.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { Role, UserStatus } from "../../../generated/prisma/enums";

type UserQuery = {
  searchTerm?: string;
  role?: Role;
  status?: UserStatus;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const category = await adminService.createCategory(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Category created successfully",
      data: category,
    });
  },
);

const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await adminService.getAllCategories();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Categories retrieved successfully",
      data: categories,
    });
  },
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await adminService.getAllUsers(req.query as UserQuery);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Users retrieved successfully",
      data: users.users,
      meta: users.meta,
    });
  },
);

const updateUserStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const { status } = req.body;

    const updatedUser = await adminService.updateUserStatus(
      userId as string,
      status,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User role updated successfully",
      data: updatedUser,
    });
  },
);

const getAllBookingsForAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const bookings = await adminService.getAllBookingsForAdmin();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Bookings retrieved successfully",
      data: bookings,
    });
  },
);

const getAdminDashboard = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAdminDashboard();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Admin dashboard data retrieved successfully",
      data: result,
    });
  },
);

const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params.id;
    const payload = req.body;
    const updatedCategory = await adminService.updateCategory(
      categoryId as string,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  },
);

export const adminController = {
  createCategory,
  getAllCategories,
  updateCategory,
  getAllUsers,
  updateUserStatus,
  getAllBookingsForAdmin,
  getAdminDashboard,
};

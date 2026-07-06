import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const registerUser = catchAsync(async(req:Request, res:Response, next: NextFunction)=>{
    const payload = req.body;
    const result = await userService.registerUserIntoDB(payload);
    console.log("result", result)

    // sendResponse(res, {
    //     success: true,
    //     statusCode: httpStatus.CREATED,
    //     message: "User registered successfully",
    //     data: result
    // })
})



export const userController = {
    registerUser
}
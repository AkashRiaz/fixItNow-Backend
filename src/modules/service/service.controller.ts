import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";

const createService = catchAsync(async(req:Request, res:Response, next:NextFunction)=>{

})


export const serviceController = {
    createService
}
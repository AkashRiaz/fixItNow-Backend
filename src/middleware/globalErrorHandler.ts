import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error: ", err);

  let statusCode;
  let errorMessage = err.message || "Internal Server Error";
  let errorName = err.name || "Internal Server Error";
  let errorDetails = err.stack || "Internal Server Error";

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage = "Your have provided incorrect filed type or missing fields ";
  }else if(err instanceof Prisma.PrismaClientKnownRequestError){
    if(err.code === "P2002"){
        statusCode = httpStatus.CONFLICT;
        errorMessage = "Unique constraint failed. Duplicate value found.";
    }else if(err.code === "P2003"){
        statusCode = httpStatus.BAD_REQUEST;
        errorMessage = "Foreign key constraint failed. Invalid reference.";
    }else if(err.code === "P2025"){
        statusCode = httpStatus.NOT_FOUND;
        errorMessage = "Record not found. The requested resource does not exist.";
    }
  }else if(err instanceof Prisma.PrismaClientInitializationError){
    if(err.errorCode === "P1000"){
        statusCode = httpStatus.UNAUTHORIZED;
        errorMessage = "Authorization failed. Invalid credentials or access denied.";
    }else if(err.errorCode === "P1001"){
        statusCode = httpStatus.SERVICE_UNAVAILABLE;
        errorMessage = "Database connection failed. Unable to connect to the database.";
    }
  }else if(err instanceof Prisma.PrismaClientUnknownRequestError){
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    errorMessage = "An unknown error occurred. Please try again later.";
  }

  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: statusCode || httpStatus.INTERNAL_SERVER_ERROR,
    name: errorName,
    message: errorMessage,
    error: errorDetails,
  });
};

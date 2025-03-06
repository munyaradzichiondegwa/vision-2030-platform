import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500;
  let errorResponse = {
    message: "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  };

  if (err instanceof CustomError) {
    statusCode = err.statusCode;
    errorResponse.message = err.message;
  }

  // Log the error
  logger.error(`[${req.method} ${req.path}] ${err.message}`, {
    error: err,
    body: req.body,
    user: req.user,
  });

  res.status(statusCode).json(errorResponse);
}

export { errorHandler as default, CustomError };

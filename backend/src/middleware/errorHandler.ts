import { Request, Response, NextFunction } from "express";

type CustomError = Error & { status?: number };
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error: CustomError = new Error("Api Not Found");
  error.status = 404;
  next(error);
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Global Error:", err);

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
  return;
};

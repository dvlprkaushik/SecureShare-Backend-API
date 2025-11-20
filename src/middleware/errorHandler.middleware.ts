import { StorageError } from "@/utils/StorageError.js";
import { ErrorRequestHandler, Response } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";

const errorResponder = (
  res: Response,
  error_name: string = "Not defined",
  error_message: string | string[] = "Internal server error",
  error_code: string | null = "SERVER_ERROR",
  statusCode: number = 500,
  req_route?: string
) => {
  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    error_name,
    error_message,
    error_code,
    route: req_route ?? "not defined",
    timestamp: new Date().toISOString(),
  });
};

export const errorhandler: ErrorRequestHandler = (err, req, res, _next) => {
  // ZodError
  if (err instanceof ZodError) {
    return errorResponder(
      res,
      err.name,
      err.issues.map((issue) => issue.message),
      "VALIDATION_FAILED",
      400,
      req.originalUrl
    );
  }
  // StorageError
  if (err instanceof StorageError) {
    return errorResponder(
      res,
      err.name,
      err.message,
      err.errorCode,
      err.statusCode,
      req.originalUrl
    );
  }

  // MulterError
  if (err instanceof MulterError) {
    return errorResponder(
      res,
      err.name,
      err.message,
      err.code,
      400,
      req.originalUrl
    );
  }

  // JS Error
  if (err instanceof Error) {
    return errorResponder(
      res,
      err.name,
      err.message,
      "SERVER_ERROR",
      500,
      req.originalUrl
    );
  }

  // Unknown errors
  return errorResponder(
    res,
    typeof err === "string" ? "UnknownError" : "UnhandledError",
    typeof err === "string" ? err : "Unexpected error occurred",
    "SERVER_ERROR",
    500,
    req.originalUrl
  );
};

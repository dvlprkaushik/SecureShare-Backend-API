import { NextFunction, Request, Response } from "express";

export const notFound = (_req: Request, res: Response, _next: NextFunction) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
    statusCode: 404,
    timestamp: new Date().toISOString(),
  });
};

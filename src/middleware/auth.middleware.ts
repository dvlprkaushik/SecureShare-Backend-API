import { StorageError } from "@/utils/StorageError.js";
import { NextFunction, Request, Response } from "express";
import { verifyToken } from "@/utils/TokenUtils.js";

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new StorageError("AUTH_REQUIRED", "Missing or malformed token")
    );
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(new StorageError("AUTH_REQUIRED", "Token not provided"));
  }

  const { id } = verifyToken(token);

  req.userId = id;

  next();
};

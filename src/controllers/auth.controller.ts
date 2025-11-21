import { NextFunction, Request, Response } from "express";
import * as auth_services from "../services/auth.services.js";
import { StorageError } from "@/utils/StorageError.js";
import { generateToken } from "@/utils/TokenUtils.js";
import { sendHeader, sendSuccess } from "@/utils/ResponseUtils.js";
import { LoginInput, RegisterInput } from "@/schemas/auth.schema.js";

type User = {
  id: number;
  email: string;
};

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.validated as RegisterInput;

    let user = await auth_services.findUserByEmail(email);
    if (user) {
      return next(new StorageError("VALIDATION_ERROR", "Email already in use"));
    }

    user = await auth_services.createUser(email, password);

    const token = generateToken({ id: user.id });

    sendHeader(res, token);

    return sendSuccess<User>(
      res,
      "User registered successfully",
      { id: user.id, email: user.email },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.validated as LoginInput;

    let user = await auth_services.findUserByEmail(email);

    if (!user) {
      return next(new StorageError("INVALID_CREDENTIALS", "Invalid email or password"));
    }

    const isValid = await auth_services.validatePassword(password, user.password);

    if (!isValid) {
      return next(
        new StorageError("INVALID_CREDENTIALS", "Invalid email or password")
      );
    }

    const token = generateToken({ id: user.id });

    sendHeader(res, token);

    return sendSuccess<User>(
      res,
      "Loggedin successfully",
      {
        id: user.id,
        email: user.email,
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

import jwt, { SignOptions } from "jsonwebtoken";
import { serverConfig as scf } from "@/config/env.config.js";
import { StorageError } from "./StorageError.js";

export interface AuthTokenPayload {
  id: number;
}

export const generateToken = (
  payload: AuthTokenPayload,
  expiry: string = scf.JWT_EXPIRES_IN
): string => {
  return jwt.sign(
    payload,
    scf.JWT_SECRET,
    { expiresIn: expiry } as SignOptions
  );
}

export const verifyToken = (token: string): AuthTokenPayload => {
  try {
    const decoded = jwt.verify(token, scf.JWT_SECRET) as AuthTokenPayload;
    return decoded;
  } catch (error) {
    throw new StorageError("INVALID_TOKEN");
  }
}

import { serverConfig as scf } from "@/config/env.config.js";
import bcrypt from "bcryptjs";

export const hashPassword = async (password: string) =>
 await bcrypt.hash(password, scf.BCRYPT_SALT_ROUNDS);

export const hashCompare = async (password: string, hashed: string) =>
  await bcrypt.compare(password, hashed);

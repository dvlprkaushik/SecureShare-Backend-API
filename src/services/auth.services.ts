import { hashCompare, hashPassword } from "@/utils/HashUtils.js";
import { prisma } from "@/utils/prisma.js";

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({ where: { email } });
};

export const createUser = async (email: string, password: string) => {
  return await prisma.user.create({
    data: {
      email: email,
      password: await hashPassword(password),
    },
  });
};

export const validatePassword = async (
  password: string,
  storedHash: string
) => {
  return await hashCompare(password, storedHash);
};

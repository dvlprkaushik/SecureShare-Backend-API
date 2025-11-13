import { PrismaClient } from "@prisma/client";

const inDev = process.env.NODE_ENV === "development";
export const prisma = new PrismaClient(
  inDev
    ? {
        log: ["error", "info", "query"],
      }
    : undefined
);

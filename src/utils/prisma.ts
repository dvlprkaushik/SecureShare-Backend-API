import { serverConfig } from "@/config/env.config.js";
import { PrismaClient } from "@prisma/client";

const inDev = serverConfig.NODE_ENV;
export const prisma = new PrismaClient(
  inDev
    ? {
        log: ["error", "info", "query"],
      }
    : undefined
);

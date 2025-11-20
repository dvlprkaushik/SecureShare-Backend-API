import { Router } from "express";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import * as shareController from "@/controllers/share.controller.js";
import { validateBody, validateParams } from "@/middleware/validation.middleware.js";
import { generateShareSchema, revokeShareSchema, shareTokenSchema } from "@/schemas/share.schema.js";

const shareRouter = Router();

shareRouter.post("/generate",authMiddleware,validateBody(generateShareSchema),shareController.generateShareLink);
shareRouter.get("/:token",validateParams(shareTokenSchema),shareController.accessSharedFile);
shareRouter.delete("/:fileId/revoke",authMiddleware,validateParams(revokeShareSchema),shareController.revokeShareLink);

export {shareRouter};

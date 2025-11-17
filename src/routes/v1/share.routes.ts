import { Router } from "express";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import * as shareController from "@/controllers/share.controller.js";

const shareRouter = Router();

shareRouter.post("/generate",authMiddleware,shareController.generateShareLink);
shareRouter.get("/:token",shareController.accessSharedFile);
shareRouter.delete("/:fileId/revoke",authMiddleware,shareController.revokeShareLink);

export {shareRouter};

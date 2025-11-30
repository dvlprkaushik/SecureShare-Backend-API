import { Router } from "express";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { validateBody } from "@/middleware/validation.middleware.js";

import * as avatar_controller from "@/controllers/userAvatar.controller.js";

import {
  avatarUploadSchema,
  avatarCompleteSchema
} from "@/schemas/avatar.schema.js";
import { avatarUploadLimiter } from "@/middleware/rateLimiter.middleware.js";

const avatarRouter = Router();

avatarRouter.post(
  "/upload-url",
  avatarUploadLimiter,
  authMiddleware,
  validateBody(avatarUploadSchema),
  avatar_controller.requestAvatarUploadUrl
);

avatarRouter.post(
  "/complete",
  authMiddleware,
  validateBody(avatarCompleteSchema),
  avatar_controller.saveAvatar
);

avatarRouter.get(
  "/",
  authMiddleware,
  avatar_controller.getAvatar
);

export { avatarRouter };

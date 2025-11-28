import { Router } from "express";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { validateBody } from "@/middleware/validation.middleware.js";

import {
  requestAvatarUploadUrl,
  saveAvatar,
  getAvatar
} from "@/controllers/userAvatar.controller.js";

import {
  avatarUploadSchema,
  avatarCompleteSchema
} from "@/schemas/avatar.schema.js";

const avatarRouter = Router();

avatarRouter.post(
  "/upload-url",
  authMiddleware,
  validateBody(avatarUploadSchema),
  requestAvatarUploadUrl
);

avatarRouter.post(
  "/complete",
  authMiddleware,
  validateBody(avatarCompleteSchema),
  saveAvatar
);

avatarRouter.get(
  "/",
  authMiddleware,
  getAvatar
);

export { avatarRouter };

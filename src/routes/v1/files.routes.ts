import * as fileController from "@/controllers/file.controller.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { upload } from "@/middleware/multer.middleware.js";
import { validateBody, validateParams, validateQuery } from "@/middleware/validation.middleware.js";
import { fileIdSchema, fileUploadSchema, moveFileSchema, renameFileSchema } from "@/schemas/file.schema.js";
import { fileFiltersQuerySchema } from "@/services/file.services.js";
import { Router } from "express";

const fileRouter = Router();

const moveHandler = [validateParams(fileIdSchema), validateBody(moveFileSchema)];
const renameHandler = [validateParams(fileIdSchema), validateBody(renameFileSchema)];

fileRouter.post("/upload", authMiddleware, upload.single("file"), validateBody(fileUploadSchema), fileController.uploadFile);
fileRouter.get("/", authMiddleware, validateQuery(fileFiltersQuerySchema), fileController.getFiles);
fileRouter.get("/:fileId", authMiddleware, validateParams(fileIdSchema), fileController.getFileById);
fileRouter.delete("/:fileId", authMiddleware, validateParams(fileIdSchema), fileController.deleteFile);
fileRouter.patch("/:fileId/move", authMiddleware, ...moveHandler, fileController.moveFile);
fileRouter.patch("/:fileId/rename", authMiddleware, ...renameHandler, fileController.renameFile);

export { fileRouter };

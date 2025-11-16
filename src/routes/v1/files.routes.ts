import { authMiddleware } from "@/middleware/auth.middleware.js";
import { upload } from "@/middleware/multer.middleware.js";
import { Router } from "express";
import * as fileController from "@/controllers/file.controller.js";

const fileRouter = Router();

fileRouter.post("/upload", authMiddleware, upload.single("file"),fileController.uploadFile);
fileRouter.get("/", authMiddleware,fileController.getFiles);
fileRouter.get("/:fileId", authMiddleware, fileController.getFileById);
fileRouter.delete("/:fileId", authMiddleware, fileController.deleteFile);
fileRouter.patch("/:fileId/move", authMiddleware, fileController.moveFile);

export { fileRouter };

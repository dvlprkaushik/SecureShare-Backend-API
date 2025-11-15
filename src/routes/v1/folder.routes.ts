import { Router } from "express";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import * as folderController from "@/controllers/folder.controller.js";

const folderRouter = Router();

folderRouter.route("/").post(authMiddleware, folderController.createFolder).get(authMiddleware, folderController.getFolders);

folderRouter.get("/:folderId", authMiddleware, folderController.getFolderById);

export {folderRouter};

import { Router } from "express";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import * as folderController from "@/controllers/folder.controller.js";
import { validateBody, validateParams } from "@/middleware/validation.middleware.js";
import { createFolderSchema, folderIdSchema } from "@/schemas/folder.schema.js";

const folderRouter = Router();

folderRouter.route("/").post(authMiddleware,validateBody(createFolderSchema), folderController.createFolder).get(authMiddleware, folderController.getFolders);

folderRouter.get("/:folderId", authMiddleware,validateParams(folderIdSchema), folderController.getFolderById);

export {folderRouter};

import { Router } from "express";
import { authRouter } from "./v1/auth.routes.js";
import { fileRouter } from "./v1/files.routes.js";
import { folderRouter } from "./v1/folder.routes.js";

const v1Routes = Router();

// auth routes
v1Routes.use("/auth", authRouter);

// file routes
v1Routes.use("/files", fileRouter);

// folder routes
v1Routes.use("/folders", folderRouter);

export { v1Routes };

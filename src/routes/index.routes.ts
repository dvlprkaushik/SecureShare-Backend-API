import { Router } from "express";
import { authRouter } from "./v1/auth.routes.js";
import { fileRouter } from "./v1/files.routes.js";

const v1Routes = Router();

// auth routes
v1Routes.use("/auth", authRouter);

// file routes
v1Routes.use("/files", fileRouter);

export { v1Routes };

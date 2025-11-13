import { Router } from "express";
import { authRouter } from "./v1/auth.routes.js";
import { fileRouter } from "./v1/files.routes.js";

const v1Routes = Router();

v1Routes.use("/auth", authRouter);

// temp
v1Routes.use("/file", fileRouter);

export { v1Routes };

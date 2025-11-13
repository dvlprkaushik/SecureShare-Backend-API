import { Router } from "express";
import { authRouter } from "./v1/auth.routes.js";

const v1Routes = Router();

v1Routes.use("/auth", authRouter);

export { v1Routes };

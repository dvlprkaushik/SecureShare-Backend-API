import { login, registerUser } from "@/controllers/auth.controller.js";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", login);

export { authRouter };

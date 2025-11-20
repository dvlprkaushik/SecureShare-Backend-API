import { login, registerUser } from "@/controllers/auth.controller.js";
import { validateBody } from "@/middleware/validation.middleware.js";
import { loginSchema, registerSchema } from "@/schemas/auth.schema.js";
import { Router } from "express";

const authRouter = Router();

// Updated: Added Zod validation middleware for body inputs using schemas.
authRouter.post("/register",validateBody(registerSchema), registerUser);
authRouter.post("/login",validateBody(loginSchema), login);

export { authRouter };

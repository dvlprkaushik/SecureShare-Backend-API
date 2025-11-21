import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { listener } from "./listener.js";
import { healthRoutes } from "./healthCheck.js";
import { serverConfig as scf } from "./config/env.config.js";
import { v1Routes } from "./routes/index.routes.js";
import { notFound } from "./middleware/notFound.middleware.js";
import { errorhandler } from "./middleware/errorHandler.middleware.js";

dotenv.config({ quiet: true });

const app = express();

// Middlewares
app.use(express.json({ limit: scf.MAX_JSON_SIZE }));
app.use(express.urlencoded({ extended: true, limit: scf.MAX_JSON_SIZE }));
app.use(cors({
  origin : "*"
}));


// Routes
app.use("/api/v1",v1Routes);


// Health routes
healthRoutes(app);


// !error handling routes
// not found handler
app.use(notFound);

// global error handler
app.use(errorhandler);

// Server Listen
listener(app);

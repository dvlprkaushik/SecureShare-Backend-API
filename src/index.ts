import express from "express";
import dotenv from "dotenv";
import { listener } from "./listener.js";
import { healthRoutes } from "./healthCheck.js";
import { serverConfig as scf } from "./config/env.config.js";

dotenv.config({ quiet: true });

const app = express();

// Middlewares
app.use(express.json({ limit: scf.MAX_JSON_SIZE }));
app.use(express.urlencoded({ extended: true, limit: scf.MAX_JSON_SIZE }));

// Health routes
healthRoutes(app);

// Server Listen
listener(app);

import rateLimit from "express-rate-limit";

export const avatarUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many avatar upload requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

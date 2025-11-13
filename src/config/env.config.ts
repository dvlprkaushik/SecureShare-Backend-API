import dotenv from "dotenv";
dotenv.config({ quiet: true });

export const serverConfig = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,

  // DB
  DATABASE_URL: process.env.DATABASE_URL!,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
  CLOUDINARY_URL: process.env.CLOUDINARY_URL,

  // File limits
  MAX_FILE_SIZE_MB: (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024,
  ALLOWED_MIME_TYPES: (process.env.ALLOWED_MIME_TYPES || "").split(","),
  MAX_JSON_SIZE: `${Number(process.env.MAX_JSON_SIZE_MB) || 2}mb`,

  // Salt rounds
  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
};

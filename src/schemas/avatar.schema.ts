import { z } from "zod";
import { serverConfig as scf } from "@/config/env.config.js";

export const avatarUploadSchema = z.strictObject({
  mimeType: z.string().refine(
    (val) => scf.ALLOWED_MIME_TYPES.includes(val),
    "Unsupported MIME type"
  ),
});

export const avatarCompleteSchema = z.strictObject({
  avatarKey: z.string().min(3, "Invalid avatar storage key"),
});

export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>;
export type AvatarCompleteInput = z.infer<typeof avatarCompleteSchema>;

import { z } from "zod";
import { serverConfig as scf } from "@/config/env.config.js";

export const fileUploadSchema = z.strictObject({
  folderId: z.preprocess(
    (val) => (val === null || val === "" || val === undefined ? null : val),
    z.coerce.number().int().nonnegative().nullable()
  ),
  filename: z.string().min(1).max(255),
  mimeType: z.string().refine(
    (val) => scf.ALLOWED_MIME_TYPES.includes(val),
    "Unsupported file type"
  ),
});

export const saveFileSchema = z.strictObject({
  fileKey: z.string().min(3, "Invalid storage key"),
  filename: z.string().min(1).max(255),
  mimeType: z.string().refine(
    (val) => scf.ALLOWED_MIME_TYPES.includes(val),
    "Unsupported file type"
  ),
  sizeKB: z.number().int().positive(),
  folderId: z.preprocess(
    (val) => (val === null || val === "" || val === undefined ? null : val),
    z.coerce.number().int().nonnegative().nullable()
  ),
});

export const fileIdSchema = z.strictObject({
  fileId: z.coerce.number().int().positive(),
});

export const moveFileSchema = z.strictObject({
  folderId: z.preprocess(
    (val) => (val === null || val === "" || val === undefined ? null : val),
    z.coerce.number().int().nonnegative().nullable()
  ),
});

export const renameFileSchema = z.strictObject({
  filename: z.string().min(1, "Filename cannot be empty").max(255),
});

export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type SaveFileInput = z.infer<typeof saveFileSchema>;
export type FileIdInput = z.infer<typeof fileIdSchema>;
export type MoveFileInput = z.infer<typeof moveFileSchema>;
export type RenameFileInput = z.infer<typeof renameFileSchema>;

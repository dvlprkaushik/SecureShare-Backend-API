import { z } from "zod";

export const fileUploadSchema = z.strictObject({
  folderId: z.coerce.number().int().nonnegative().optional(),
});

export const fileIdSchema = z.strictObject({
  fileId: z.coerce.number().int().positive(),
});

export const moveFileSchema = z.strictObject({
  folderId: z.preprocess((val) => {
    if (val === "null" || val === "0" || val === "" || val === undefined) {
      return null;
    }
    return val;
  }, z.coerce.number().int().positive().nullable()),
});

export const renameFileSchema = z.strictObject({
  filename: z.string().min(1, "Filename cannot be empty").max(255),
});

export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type FileIdInput = z.infer<typeof fileIdSchema>;
export type MoveFileInput = z.infer<typeof moveFileSchema>;
export type RenameFileInput = z.infer<typeof renameFileSchema>;

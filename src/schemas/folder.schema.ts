import { z } from 'zod';

export const createFolderSchema = z.strictObject({
  folderName: z.string().trim().min(1, 'Invalid folder name'),
  parentId: z.coerce.number().int().positive().nullable().optional()
});

export const folderIdSchema = z.strictObject({
  folderId: z.coerce.number().int().positive()
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type FolderIdInput = z.infer<typeof folderIdSchema>;

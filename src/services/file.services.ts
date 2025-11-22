import { prisma } from "@/utils/prisma.js";
import { StorageError } from "@/utils/StorageError.js";
import { findFolderById } from "./folder.services.js";
import { z } from "zod/v4";

export interface Metadata {
  filename: string;
  mimeType: string;
  sizeKB: number;

  // fix: removed cloudUrl because private Cloudinary uploads don't expose static URLs
  // cloudUrl: string;

  cloudPublicId: string;
  userId: number;
  folderId?: number | null;
  shareToken?: string | null;
  shareExpiry?: Date | null;
}

export const createFileMetadata = async (data: Metadata) => {
  try {
    const {
      // fix: removed cloudUrl
      // cloudUrl,

      filename,
      mimeType,
      cloudPublicId,
      sizeKB,
      userId,
      folderId,
      shareExpiry,
      shareToken,
    } = data;

    const record = await prisma.fileMetaData.create({
      data: {
        // fix: removed cloudUrl from DB write
        // cloudUrl,

        filename,
        mimeType,
        cloudPublicId,
        sizeKB,
        userid: userId,
        folderId: folderId,
        shareExpiry: shareExpiry,
        shareToken: shareToken,
      },
    });

    return record;
  } catch (error) {
    throw new StorageError(
      "DATABASE_ERROR",
      "Failed to create file metadata in database"
    );
  }
};

export const fileFiltersQuerySchema = z.object({
  mimeType: z.string().optional(),
  folderId: z.coerce.number().int().nonnegative().optional().nullable(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).optional(),
});

export type FileFilters = z.infer<typeof fileFiltersQuerySchema>;

// fix: removed cloudUrl from Files type since private uploads don't expose static URLs
export type Files = {
  id: number;
  filename: string;
  mimeType: string;
  sizeKB: number;
  uploadedAt: Date;
  folderId: number | null;
};

export interface FileDto<T> {
  files: T;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getUserFiles = async (
  userId: number,
  filters: FileFilters
): Promise<FileDto<Files[]>> => {
  try {
    const { mimeType, folderId } = filters ?? {};

    const pageNum = Number(filters?.page) || 1;
    const limitNum = Math.min(Number(filters?.limit) || 10, 100);

    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    const fields: any = { userid: userId };

    if (typeof folderId !== "undefined") {
      fields.folderId = folderId;
    }
    if (typeof mimeType === "string" && mimeType.trim() !== "") {
      fields.mimeType = mimeType;
    }

    const [files, total] = await Promise.all([
      prisma.fileMetaData.findMany({
        where: fields,
        skip,
        take,
        orderBy: { uploadedAt: "desc" },
      }),
      prisma.fileMetaData.count({ where: fields }),
    ]);

    return {
      files: files,
      meta: {
        page: pageNum,
        limit: limitNum,
        total: total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  } catch (error) {
    throw new StorageError("FILE_NOT_FOUND", "Failed to fetch files");
  }
};

export const findFileById = async (fileId: number) => {
  try {
    const record = await prisma.fileMetaData.findUnique({
      where: { id: fileId },
    });

    if (!record) {
      throw new StorageError("FILE_NOT_FOUND");
    }
    return record;
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError("DATABASE_ERROR", "Failed to fetch file");
  }
};

export const validateFolderOwnership = async (
  folderId: number | null | undefined,
  userId: number
) => {
  try {
    if (folderId === null) return;
    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
      },
    });

    if (!folder) {
      throw new StorageError("FOLDER_NOT_FOUND", "Folder does not exist");
    }

    if (folder.userId !== userId) {
      throw new StorageError("ACCESS_DENIED", "You do not own this folder");
    }

    return folder;
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError("DATABASE_ERROR", "Failed to validate folder");
  }
};

export const deleteFileById = async (fileId: number) => {
  try {
    await prisma.fileMetaData.delete({
      where: { id: fileId },
    });
  } catch (error) {
    throw new StorageError(
      "DATABASE_ERROR",
      "Failed to delete file from database"
    );
  }
};

export const moveFileToFolder = async (
  folderId: number | null,
  fileId: number,
  userId: number
) => {
  const file = await findFileById(fileId);
  if (!file) {
    throw new StorageError("FILE_NOT_FOUND");
  }
  if (file.userid !== userId) {
    throw new StorageError("ACCESS_DENIED");
  }

  if (folderId !== null) {
    const folder = await findFolderById(folderId);

    if (!folder) {
      throw new StorageError(
        "FOLDER_NOT_FOUND",
        "target folder does not exist"
      );
    }

    if (folder.userId !== userId) {
      throw new StorageError(
        "ACCESS_DENIED",
        "You cannot move file to this folder"
      );
    }
  }

  try {
    const updatedFile = await prisma.fileMetaData.update({
      where: { id: fileId },
      data: {
        folderId: folderId ?? null,
      },
    });

    return updatedFile;
  } catch (error) {
    throw new StorageError("DATABASE_ERROR", "Failed to move file");
  }
};

export const renameFileById = async (
  fileId: number,
  newFileName: string,
  userId: number
) => {
  const file = await findFileById(fileId);

  if (file.userid !== userId) {
    throw new StorageError("ACCESS_DENIED", "You do not down this file");
  }

  try {
    const updated = await prisma.fileMetaData.update({
      where: { id: fileId },
      data: {
        filename: newFileName,
      },
    });

    return updated;
  } catch (error) {
    throw new StorageError("DATABASE_ERROR", "Failed to rename file");
  }
};

import { prisma } from "@/utils/prisma.js";
import { StorageError } from "@/utils/StorageError.js";

export interface Metadata {
  filename: string;
  mimeType: string;
  sizeKB: number;
  cloudUrl: string;
  cloudPublicId: string;
  userId: number;
  folderId?: number | null;
  shareToken?: string | null;
  shareExpiry?: Date | null;
}

export const createFileMetadata = async (data: Metadata) => {
  try {
    const {
      cloudUrl,
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
        cloudUrl,
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

export interface FileFilters extends Pick<Metadata, "folderId" | "mimeType"> {
  page?: number | null;
  limit?: number | null;
}

export type Files = {
  id: number;
  filename: string;
  mimeType: string;
  sizeKB: number;
  cloudUrl: string;
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
        select: {
          id: true,
          filename: true,
          mimeType: true,
          sizeKB: true,
          cloudUrl: true,
          uploadedAt: true,
          folderId: true,
        },
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

export const findFileById = async (fileId: number): Promise<Files> => {
  try {
    const record = await prisma.fileMetaData.findUnique({
      where: {
        id: fileId,
      },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        sizeKB: true,
        cloudUrl: true,
        uploadedAt: true,
        folderId: true,
      },
    });

    if (!record) {
      throw new StorageError("FILE_NOT_FOUND");
    }
    return {
      id: record.id,
      filename: record.filename,
      mimeType: record.mimeType,
      sizeKB: record.sizeKB,
      cloudUrl: record.cloudUrl,
      uploadedAt: record.uploadedAt,
      folderId: record.folderId,
    };
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
    if (folderId === null ) return ;
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

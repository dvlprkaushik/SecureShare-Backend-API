import { prisma } from "@/utils/prisma.js";
import { StorageError } from "@/utils/StorageError.js";

interface CreateFolderDto {
  folderName: string;
  userId: number;
  parentId?: number | null;
}

export const createFolder = async (data: CreateFolderDto) => {
  try {
    return await prisma.folder.create({
      data: {
        name: data.folderName,
        userId: data.userId,
        parentId: data.parentId ?? null,
      },
    });
  } catch (error) {
    throw new StorageError("DATABASE_ERROR", "Failed to create folder");
  }
};

export const findUserFolders = async (userId: number) => {
  try {
    return await prisma.folder.findMany({
      where: { userId: userId },
    });
  } catch (error) {
    throw new StorageError("DATABASE_ERROR", "Failed to fetch folders");
  }
};

export const findFolderById = async (folderId: number) => {
  try {
    return await prisma.folder.findUnique({
      where: { id: folderId },
    });
  } catch (error) {
    throw new StorageError("DATABASE_ERROR", "Failed to find folder");
  }
};

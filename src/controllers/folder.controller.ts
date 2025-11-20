import { StorageError } from "@/utils/StorageError.js";
import { NextFunction, Request, Response } from "express";
import * as folder_service from "@/services/folder.services.js";
import { sendSuccess } from "@/utils/ResponseUtils.js";
import { Files } from "@/services/file.services.js";
import { CreateFolderInput, FolderIdInput } from "@/schemas/folder.schema.js";

export interface SafeFolderDto {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: Date;
}

export const createFolder = async (
  req: Request<{}, {}, CreateFolderInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { folderName, parentId } = req.body;
    const parentIdNumber = parentId ?? null;

    if (parentIdNumber !== null) {
      const folder = await folder_service.findFolderById(parentIdNumber);
      if (!folder) {
        return next(new StorageError("FOLDER_NOT_FOUND"));
      }

      if (folder?.userId !== req.userId) {
        return next(
          new StorageError("ACCESS_DENIED", "You do not own this folder")
        );
      }
    }

    const folder = await folder_service.createFolder({
      folderName: folderName,
      userId: req.userId,
      parentId: parentIdNumber,
    });

    sendSuccess<SafeFolderDto>(
      res,
      "Folder created successfully",
      {
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        createdAt: folder.createdAt,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    const rawFolders = await folder_service.findUserFolders(userId);

    const folders: SafeFolderDto[] = rawFolders.map((f) => ({
      id: f.id,
      name: f.name,
      parentId: f.parentId,
      createdAt: f.createdAt,
    }));
    sendSuccess<{ folders: SafeFolderDto[] }>(
      res,
      "Folders fetched successfully",
      { folders },
      200
    );
  } catch (error) {
    next(error);
  }
};

interface NestedFolderDto {
  folder: SafeFolderDto;
  subfolders: SafeFolderDto[];
  files: Files[];
}
export const getFolderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { folderId } = req.params as unknown as FolderIdInput;

    const rawFolder = await folder_service.findFolderById(folderId);

    if (!rawFolder) {
      return next(new StorageError("FOLDER_NOT_FOUND"));
    }

    if (rawFolder.userId !== req.userId) {
      return next(
        new StorageError("ACCESS_DENIED", "You do not own this folder")
      );
    }

    const folder: SafeFolderDto = {
      id: rawFolder.id,
      name: rawFolder.name,
      parentId: rawFolder.parentId,
      createdAt: rawFolder.createdAt,
    };

    const rawSubFolders = await folder_service.findSubFolders(
      folderId,
      req.userId
    );

    const subFolders: SafeFolderDto[] = rawSubFolders.map((f) => ({
      id: f.id,
      name: f.name,
      parentId: f.parentId,
      createdAt: f.createdAt,
    }));

    const rawfiles = await folder_service.findFilesByFolder(
      folderId,
      req.userId
    );

    const files: Files[] = rawfiles.map((f) => ({
      id: f.id,
      filename: f.filename,
      mimeType: f.mimeType,
      sizeKB: f.sizeKB,
      cloudUrl: f.cloudUrl,
      uploadedAt: f.uploadedAt,
      folderId: f.folderId,
    }));

    sendSuccess<NestedFolderDto>(
      res,
      "Folder fetched successfully",
      { folder: folder, subfolders: subFolders, files: files },
      200
    );
  } catch (error) {
    next(error);
  }
};

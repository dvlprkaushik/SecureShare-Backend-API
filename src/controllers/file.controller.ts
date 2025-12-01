import {
  FileIdInput,
  FileUploadInput,
  MoveFileInput,
  RenameFileInput,
  SaveFileInput,
} from "@/schemas/file.schema.js";
import * as file_service from "@/services/file.services.js";
import {
  generateFileKey,
  getPresignedUploadURL,
  deleteFromS3,
} from "@/services/s3.services.js";
import { sendSuccess } from "@/utils/ResponseUtils.js";
import { StorageError } from "@/utils/StorageError.js";
import { NextFunction, Request, Response } from "express";

export const getUploadUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { folderId, filename, mimeType } = req.validated
      ?.body as FileUploadInput;

    await file_service.validateFolderOwnership(folderId ?? null, req.userId);

    const fileKey = generateFileKey(req.userId, filename);
    const uploadUrl = await getPresignedUploadURL(fileKey, mimeType);

    return sendSuccess(
      res,
      "Upload URL generated",
      {
        fileKey,
        uploadUrl, // frontend uses this to PUT file to S3
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

// storing metadata after uploading
export const saveFileMetadata = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileKey, filename, mimeType, sizeKB, folderId } =
      req.validated?.body as SaveFileInput;

    await file_service.validateFolderOwnership(folderId ?? null, req.userId);

    const saved = await file_service.createFileMetadata({
      filename,
      mimeType,
      sizeKB,
      fileKey,
      userId: req.userId,
      folderId,
    });

    return sendSuccess<file_service.Files>(
      res,
      "File metadata stored",
      {
        id: saved.id,
        filename: saved.filename,
        mimeType: saved.mimeType,
        sizeKB: saved.sizeKB,
        uploadedAt: saved.uploadedAt,
        folderId: saved.folderId,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = req.validated?.query as file_service.FileFilters;
    const result = await file_service.getUserFiles(req.userId, filters);

    // result already uses DTO (id, name, etc)
    return sendSuccess(res, "Files fetched", result, 200);
  } catch (error) {
    next(error);
  }
};

export const getFileById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.validated?.params as FileIdInput;

    const file = await file_service.findFileById(fileId);

    if (file.userid !== req.userId) {
      return next(
        new StorageError("ACCESS_DENIED", "You do not own this file")
      );
    }

    return sendSuccess<file_service.Files>(
      res,
      "File fetched",
      {
        id: file.id,
        filename: file.filename,
        mimeType: file.mimeType,
        sizeKB: file.sizeKB,
        uploadedAt: file.uploadedAt,
        folderId: file.folderId,
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.validated?.params as FileIdInput;
    const file = await file_service.findFileById(fileId);

    if (file.userid !== req.userId) {
      return next(new StorageError("ACCESS_DENIED"));
    }

    // delete from s3 storage
    await deleteFromS3(file.fileKey);

    // delete DB record
    await file_service.deleteFileById(fileId, req.userId);

    return sendSuccess(res, "File deleted", null, 204);
  } catch (error) {
    next(error);
  }
};

export const moveFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.validated?.params as FileIdInput;
    const { folderId } = req.validated?.body as MoveFileInput;

    const updated = await file_service.moveFileToFolder(
      folderId,
      fileId,
      req.userId
    );

    return sendSuccess<file_service.Files>(
      res,
      "File moved",
      {
        id: updated.id,
        filename: updated.filename,
        mimeType: updated.mimeType,
        sizeKB: updated.sizeKB,
        uploadedAt: updated.uploadedAt,
        folderId: updated.folderId,
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

export const renameFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.validated?.params as FileIdInput;
    const { newFilename } = req.validated?.body as RenameFileInput;

    const updated = await file_service.renameFileById(
      fileId,
      newFilename,
      req.userId
    );

    return sendSuccess<file_service.Files>(
      res,
      "File renamed",
      {
        id: updated.id,
        filename: updated.filename,
        mimeType: updated.mimeType,
        sizeKB: updated.sizeKB,
        uploadedAt: updated.uploadedAt,
        folderId: updated.folderId,
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

import * as file_service from "@/services/file.services.js";
import * as cloud_service from "@/services/cloudinary.services.js";
import { StorageError } from "@/utils/StorageError.js";
import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "@/utils/ResponseUtils.js";

export const uploadFile = async (
  req: Request<{}, {}, { folderId?: number | null }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file || !req.file.buffer) {
      return next(new StorageError("NO_FILE"));
    }
    const { folderId } = req.body;

    const folderIdNumber = folderId != null ? Number(folderId) : null;

    await file_service.validateFolderOwnership(folderIdNumber, req.userId);

    const upload_result = await cloud_service.uploadToCloudinary(req.file);

    const saved = await file_service.createFileMetadata({
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeKB: Math.ceil(upload_result.bytes / 1024),
      cloudUrl: upload_result.secure_url,
      cloudPublicId: upload_result.public_id,
      userId: req.userId,
      folderId: folderIdNumber,
    });

    return sendSuccess<file_service.Files>(
      res,
      "File uploaded successfully",
      {
        id: saved.id,
        filename: saved.filename,
        mimeType: saved.mimeType,
        sizeKB: saved.sizeKB,
        cloudUrl: saved.cloudUrl,
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
  req: Request<{}, {}, {}, file_service.FileFilters>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { mimeType, folderId, limit, page } = req.query;

    const folderIdNumber = folderId != null ? Number(folderId) : null;

    const files_result = await file_service.getUserFiles(req.userId, {
      folderId: folderIdNumber,
      mimeType: mimeType,
      page: page,
      limit: limit,
    });

    return sendSuccess(res, "Files fetched successfully", files_result, 200);
  } catch (error) {
    next(error);
  }
};

export const getFileById = async (
  req: Request<{ fileId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const fileId = Number(req.params.fileId);
    if (isNaN(fileId)) {
      return next(new StorageError("VALIDATION_ERROR", "Invalid file id"));
    }

    const file = await file_service.findFileById(fileId);

    if (file.userid !== req.userId) {
      return next(
        new StorageError("ACCESS_DENIED", "You do not own this file")
      );
    }

    return sendSuccess(res, "File fetched successfully", {
      id: file.id,
      filename: file.filename,
      mimeType: file.mimeType,
      sizeKB: file.sizeKB,
      cloudUrl: file.cloudUrl,
      uploadedAt: file.uploadedAt,
      folderId: file.folderId,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (
  req: Request<{ fileId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const fileId = Number(req.params.fileId);
    if (isNaN(fileId)) {
      return next(new StorageError("VALIDATION_ERROR", "Invalid file id"));
    }
    const file = await file_service.findFileById(fileId);

    if (!file) {
      return next(new StorageError("FILE_NOT_FOUND"));
    }

    if (file.userid !== req.userId) {
      return next(
        new StorageError("ACCESS_DENIED", "You do not own this file")
      );
    }

    await cloud_service.deleteFromCloudinary(file.cloudPublicId);

    await file_service.deleteFileById(fileId);

    return sendSuccess(res, "File deleted successfully", null, 203);
  } catch (error) {
    next(error);
  }
};

export const moveFile = async (
  req: Request<{ fileId: string }, {}, { folderId: string | null }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const fileIdNumber = Number(req.params.fileId);
    const folderIdNumber = Number(req.body.folderId);
    const userId = req.userId;

    if (isNaN(fileIdNumber)) {
      return next(new StorageError("VALIDATION_ERROR", "Invalid file id"));
    }

    if (req.body.folderId !== null && isNaN(folderIdNumber)) {
      return next(new StorageError("VALIDATION_ERROR", "Invalid folder id"));
    }

    const updated = await file_service.moveFileToFolder(
      folderIdNumber,
      fileIdNumber,
      userId
    );

    sendSuccess<file_service.Files>(
      res,
      "File moved successfully",
      {
        id: updated.id,
        filename: updated.filename,
        mimeType: updated.mimeType,
        sizeKB: updated.sizeKB,
        cloudUrl: updated.cloudUrl,
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
  req: Request<{ fileId: string }, {}, { newFileName: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const fileIdNumber = Number(req.params.fileId);
    const { newFileName } = req.body;
    const userId = req.userId;

    if (isNaN(fileIdNumber)) {
      return next(new StorageError("VALIDATION_ERROR", "Invalid file id"));
    }

    if (!newFileName || newFileName.trim() === "") {
      return next(new StorageError("VALIDATION_ERROR", "Invalid filename"));
    }
    const updated = await file_service.renameFileById(
      fileIdNumber,
      newFileName,
      userId
    );

    sendSuccess<file_service.Files>(
      res,
      "File renamed successfully",
      {
        id: updated.id,
        filename: updated.filename,
        mimeType: updated.mimeType,
        sizeKB: updated.sizeKB,
        cloudUrl: updated.cloudUrl,
        uploadedAt: updated.uploadedAt,
        folderId: updated.folderId,
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

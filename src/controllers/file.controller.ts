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
  req: Request<{ fileId: number }>,
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

import { StorageError } from "@/utils/StorageError.js";
import { NextFunction, Request, Response } from "express";
import * as share_service from "@/services/share.services.js";
import { sendSuccess } from "@/utils/ResponseUtils.js";
import { serverConfig as scf } from "@/config/env.config.js";
import { Files } from "@/services/file.services.js";

export interface ShareSafeDto {
  fileId: number;
  shareUrl: string;
  token: string;
  expiresAt: Date;
}
export const generateShareLink = async (
  req: Request<{}, {}, { fileId: string; expiryHours: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const fileIdNumber = Number(req.body.fileId);
    const expiryHoursNumber = Number(req.body.expiryHours);

    if (isNaN(fileIdNumber)) {
      return next(new StorageError("VALIDATION_ERROR", "Invalid fileId"));
    }

    if (isNaN(expiryHoursNumber)) {
      return next(new StorageError("VALIDATION_ERROR", "Invalid expiryHours"));
    }

    const userId = req.userId;

    const updated = await share_service.generateShareLink(
      fileIdNumber,
      expiryHoursNumber,
      userId
    );

    return sendSuccess<ShareSafeDto>(
      res,
      "Share link generated successfully",
      {
        fileId: updated.id,
        shareUrl: `${scf.BASE_URL}/api/v1/share/${updated.shareToken}`,
        token: updated.shareToken!,
        expiresAt: updated.shareExpiry!,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const accessSharedFile = async (
  req: Request<{ token: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const shareToken = req.params.token;

    if (!shareToken || shareToken.trim() === "") {
      return next(new StorageError("VALIDATION_ERROR", "Invalid share token"));
    }

    const file = await share_service.accessSharedFile(shareToken);

    return sendSuccess<Files>(
      res,
      "File accessed via public link",
      {
        id: file.id,
        filename: file.filename,
        mimeType: file.mimeType,
        sizeKB: file.sizeKB,
        cloudUrl: file.cloudUrl,
        uploadedAt: file.uploadedAt,
        folderId: file.folderId,
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

export const revokeShareLink = async (
  req: Request<{ fileId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const fileIdNumber = Number(req.params.fileId);
    const userId = req.userId;

    if (isNaN(fileIdNumber)) {
      return next(new StorageError("VALIDATION_ERROR", "Invalid file id"));
    }

    const { fileId, revoked } = await share_service.revokeShareLink(
      fileIdNumber,
      userId
    );

    return sendSuccess<{ fileId: number; revoked: boolean }>(
      res,
      "Share link revoked successfully",
      {
        fileId: fileId,
        revoked: revoked,
      }
    );
  } catch (error) {
    next(error);
  }
};

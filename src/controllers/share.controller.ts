import { NextFunction, Request, Response } from "express";
import * as share_service from "@/services/share.services.js";
import { sendSuccess } from "@/utils/ResponseUtils.js";
import { serverConfig as scf } from "@/config/env.config.js";
import {
  GenerateShareInput,
  ShareTokenInput,
} from "@/schemas/share.schema.js";
import { FileIdInput } from "@/schemas/file.schema.js";
import * as s3_service from "@/services/s3.services.js";

export interface SafeShareDto {
  fileId: number;
  shareUrl: string;
  token: string;
  expiresAt: Date;
}

export const generateShareLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId, expiryValue, expiryUnit } = req.validated?.body as GenerateShareInput;
    const userId = req.userId;

    // convert user input to hours (service expects hours)
    let expiryHours = expiryValue;
    if (expiryUnit === "min") expiryHours = expiryValue / 60;
    if (expiryUnit === "day") expiryHours = expiryValue * 24;

    const updated = await share_service.generateShareLink(
      fileId,
      expiryHours,
      userId
    );

    return sendSuccess<SafeShareDto>(
      res,
      "Share link generated",
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
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.validated?.params as ShareTokenInput;

    const file = await share_service.accessSharedFile(token);

    // short lived only
    const preSignedUrl = await s3_service.getPresignedDownloadURL(file.fileKey);

    return sendSuccess(res, "File access granted", {
      fileId: file.id,
      filename: file.filename,
      mimeType: file.mimeType,
      sizeKB: file.sizeKB,
      expiresAt: file.shareExpiry,
      downloadUrl: preSignedUrl,
    })
  } catch (error) {
    next(error);
  }
};

export const revokeShareLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.validated?.params as FileIdInput;
    const userId = req.userId;

    const { fileId: revokedFileId, revoked } =
      await share_service.revokeShareLink(fileId, userId);

    return sendSuccess<{ fileId: number; revoked: boolean }>(
      res,
      "Share link revoked",
      {
        fileId: revokedFileId,
        revoked,
      }
    );
  } catch (error) {
    next(error);
  }
};

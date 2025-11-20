import { NextFunction, Request, Response } from "express";
import * as share_service from "@/services/share.services.js";
import { sendSuccess } from "@/utils/ResponseUtils.js";
import { serverConfig as scf } from "@/config/env.config.js";
import { Files } from "@/services/file.services.js";
import {
  GenerateShareInput,
  ShareTokenInput,
} from "@/schemas/share.schema.js";
import { FileIdInput } from "@/schemas/file.schema.js";

export interface SafeShareDto {
  fileId: number;
  shareUrl: string;
  token: string;
  expiresAt: Date;
}

export const generateShareLink = async (
  req: Request<{}, {}, GenerateShareInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId, expiryHours } = req.body;

    const userId = req.userId;

    const updated = await share_service.generateShareLink(
      fileId,
      expiryHours,
      userId
    );

    return sendSuccess<SafeShareDto>(
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
  req: Request<ShareTokenInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;

    const file = await share_service.accessSharedFile(token);

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
  req: Request<FileIdInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.params;
    const userId = req.userId;

    const { fileId: revokedFileId, revoked } =
      await share_service.revokeShareLink(fileId, userId);

    return sendSuccess<{ fileId: number; revoked: boolean }>(
      res,
      "Share link revoked successfully",
      {
        fileId: revokedFileId,
        revoked: revoked,
      }
    );
  } catch (error) {
    next(error);
  }
};

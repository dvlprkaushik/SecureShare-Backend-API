import { NextFunction, Request, Response } from "express";
import * as share_service from "@/services/share.services.js";
import { sendSuccess } from "@/utils/ResponseUtils.js";
import { serverConfig as scf } from "@/config/env.config.js";
import {
  GenerateShareInput,
  ShareTokenInput,
} from "@/schemas/share.schema.js";
import { FileIdInput } from "@/schemas/file.schema.js";
import { getViewableResourceType, signedUrlGenerate } from "@/services/cloudinary.services.js";

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
    const { fileId, expiryHours } = req.validated?.body as GenerateShareInput;

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
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.validated?.params as ShareTokenInput;

    const file = await share_service.accessSharedFile(token);

    const expiresAtUnix = Math.floor(new Date(file.shareExpiry!).getTime() / 1000);

    // using the existing mimeType field from DB
    const resourceType = getViewableResourceType(file.mimeType);

    // fix: generate signed Cloudinary URL for temporary access
    const signedUrl = await signedUrlGenerate(file.cloudPublicId,file.cloudVersion!, expiresAtUnix, resourceType);
    
    // fix: redirecting user to signed URL instead of returning JSON with cloudUrl
    return res.redirect(signedUrl);
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

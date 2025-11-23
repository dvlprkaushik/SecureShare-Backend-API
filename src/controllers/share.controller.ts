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
import https from "https";

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

    const expiresAtUnix = Math.floor(
      new Date(file.shareExpiry!).getTime() / 1000
    );

    const resourceType = getViewableResourceType(file.mimeType);

    const signedUrl = await signedUrlGenerate(
      file.cloudPublicId,
      expiresAtUnix,
      file.cloudVersion,
      resourceType
    );

    // inline preview, no cache
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Cache-Control", "no-store");

    https
      .get(signedUrl, (cloudRes) => {
        cloudRes.pipe(res);
      })
      .on("error", () => {
        if (!res.headersSent)
          return res.status(500).json({ error: "Failed to fetch asset" });
        res.end();
      });
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

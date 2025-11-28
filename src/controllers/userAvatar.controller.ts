import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "@/utils/ResponseUtils.js";
import { StorageError } from "@/utils/StorageError.js";
import { AvatarUploadInput, AvatarCompleteInput } from "@/schemas/avatar.schema.js";
import * as avatarService from "@/services/avatar.services.js";
import * as s3Service from "@/services/s3.services.js";

export const requestAvatarUploadUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mimeType } = req.validated?.body as AvatarUploadInput;

    const avatarKey = s3Service.generateAvatarkey(req.userId, mimeType);
    const uploadUrl = await s3Service.getPresignedUploadURL(avatarKey, mimeType);

    return sendSuccess(res, "Avatar upload URL created", {
      avatarKey,
      uploadUrl,
    });
  } catch (err) {
    next(err);
  }
};

export const saveAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { avatarKey } = req.validated?.body as AvatarCompleteInput;

    const updated = await avatarService.updateAvatarKey(req.userId, avatarKey);

    return sendSuccess(res, "Avatar updated", {
      id: updated.id,
      email: updated.email,
      avatarKey: updated.avatarKey,
    },201);
  } catch (err) {
    next(err);
  }
};

export const getAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const avatarKey = await avatarService.getUserAvatarKey(req.userId);

    if (!avatarKey) {
      throw new StorageError("RECORD_NOT_FOUND", "Avatar key not found")
    }

    const signedUrl = await s3Service.getPresignedDownloadURL(avatarKey);

    return sendSuccess(res, "Avatar access granted", {
      url: signedUrl,
    },200);
  } catch (err) {
    next(err);
  }
};

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

export const saveAvatar = async (req : Request, res : Response, next : NextFunction) => {
  try {
    const { avatarKey } = req.validated?.body as AvatarCompleteInput;

    if (!avatarKey.startsWith(`users/${req.userId}/`)) {
      throw new StorageError("ACCESS_DENIED", "Invalid avatar key");
    }

    const fileExists = await s3Service.checkFileExists(avatarKey);
    if(!fileExists){
      throw new StorageError("FILE_NOT_FOUND", "Avatar file not uploaded to S3");
    }
    
    const oldAvatarKey = await avatarService.getUserAvatarKey(req.userId);

    if (oldAvatarKey && oldAvatarKey !== avatarKey) {
      await s3Service.deleteFromS3(oldAvatarKey);
    }

    const updated = await avatarService.updateAvatarKey(req.userId, avatarKey);

    return sendSuccess(res, "Avatar updated", {
      id: updated.id,
      email: updated.email,
      avatarKey: updated.avatarKey,
    });
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

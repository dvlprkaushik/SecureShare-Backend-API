import { nanoid } from "nanoid";
import * as file_service from "@/services/file.services.js";
import { StorageError } from "@/utils/StorageError.js";
import { prisma } from "@/utils/prisma.js";

export const generateToken = (tokenLength?: number) => {
  return nanoid(tokenLength || 32);
};

export const generateShareLink = async (
  fileId: number,
  expiryHours: number,
  userId: number
) => {
  const file = await file_service.findFileById(fileId);
  if (!file) {
    throw new StorageError("FILE_NOT_FOUND");
  }

  if (file.userid !== userId) {
    throw new StorageError("ACCESS_DENIED", "You do not own this file");
  }

  if (expiryHours <= 0) {
    throw new StorageError(
      "VALIDATION_ERROR",
      "Expiry hours cannot be 0 or less than 0"
    );
  }

  const shareExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

  const shareToken = generateToken();
  try {
    const generated = await prisma.fileMetaData.update({
      where: { id: fileId },
      data: {
        shareExpiry: shareExpiry,
        shareToken: shareToken,
      },
    });
    return generated;
  } catch (error) {
    throw new StorageError("DATABASE_ERROR", "Failed to generate link");
  }
};

export const accessSharedFile = async (shareToken: string) => {
  const file = await prisma.fileMetaData.findUnique({
    where: {
      shareToken: shareToken,
    },
  });

  if (!file) {
    throw new StorageError("SHARE_NOT_FOUND", "Invalid or revoked share link");
  }

  if (!file.shareExpiry) {
    throw new StorageError("SHARE_NOT_FOUND", "Share link is not active");
  }

  const isExpired = file.shareExpiry < new Date();

  if (isExpired) {
    throw new StorageError("SHARE_EXPIRED", "Share link has expired");
  }

  return file;
};

export const revokeShareLink = async (fileId: number, userId: number) => {
  const file = await file_service.findFileById(fileId);
  if (!file) {
    throw new StorageError("FILE_NOT_FOUND");
  }

  if (file.userid !== userId) {
    throw new StorageError("ACCESS_DENIED", "You do not own this file");
  }

  try {
    await prisma.fileMetaData.update({
      where: { id: fileId },
      data: {
        shareExpiry: null,
        shareToken: null,
      },
    });
    return { fileId, revoked: true };
  } catch (error) {
    throw new StorageError("DATABASE_ERROR", "Failed to revoke share link");
  }
};

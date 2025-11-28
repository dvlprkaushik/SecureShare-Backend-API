import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/config/s3.config.js";
import { serverConfig as scf } from "@/config/env.config.js";
import { nanoid } from "nanoid";

const BUCKET = scf.S3_BUCKET;

export const getPresignedUploadURL = async (
  key: string,
  mimeType: string,
  expiresInSec: number = 300
) => {
  if (!scf.ALLOWED_MIME_TYPES.includes(mimeType))
    throw new Error("Invalid mimeType , not allowed");
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
  });

  return await getSignedUrl(s3, command, { expiresIn: expiresInSec });
};

export const getPresignedDownloadURL = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return await getSignedUrl(s3, command, { expiresIn: 600 });
};

export const deleteFromS3 = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3.send(command);
};

// File key generation
export const generateFileKey = (
  userId: number,
  originalName: string
): string => {
  const safe = originalName.replace(/\s+/g, "_");
  return `users/${userId}/uploads/${Date.now()}_${nanoid(10)}_${safe}`;
};

export const generateAvatarkey = (userId: number, mimeType: string): string => {
  const ext = mimeType.split("/")[1] || "png";
  return `users/${userId}/avatar.${ext}`;
};

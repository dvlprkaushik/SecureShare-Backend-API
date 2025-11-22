import cloudinary from "@/config/cloudinary.config.js";
import streamifier from "streamifier";
import type { UploadApiResponse } from "cloudinary";
import { StorageError } from "@/utils/StorageError.js";

export const uploadToCloudinary = (
  file: Express.Multer.File
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    if (!file?.buffer) {
      return reject(
        new Error("File buffer not provided")
      );
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        type : "private",
        folder : 'SecureShareRoot'
      },
      (error: any, result: UploadApiResponse | undefined) => {
        if (error) return reject(error);

        if (!result) {
          return reject(
            new StorageError("UPLOAD_FAILED", "Cloudinary returned no result")
          );
        }

        resolve(result);
      }
    );

    streamifier
      .createReadStream(file.buffer)
      .on("error", reject)
      .pipe(uploadStream);
  });
};

export const signedUrlGenerate = async (cloudPublicId : string, expiresAtUnix : number) => {
  return cloudinary.url(cloudPublicId, {
    type: "private",
    resource_type: "auto",
    sign_url: true,
    expires_at: expiresAtUnix,
  })
};

export const deleteFromCloudinary = async (
  publicId: string,
  options?: { resource_type?: "image" | "raw" | "video" }
) => {
  try {
    return await cloudinary.uploader.destroy(publicId, options);
  } catch (err) {
    throw new StorageError(
      "DELETE_FAILED",
      "Failed to delete file from Cloudinary"
    );
  }
};

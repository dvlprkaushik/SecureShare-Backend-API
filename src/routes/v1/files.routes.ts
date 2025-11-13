import { upload } from "@/middleware/multer.middleware.js";
import { uploadToCloudinary } from "@/services/cloudinary.services.js";
import { sendSuccess } from "@/utils/ResponseUtils.js";
import { StorageError } from "@/utils/StorageError.js";
import { NextFunction, Request, Response, Router } from "express";

const fileRouter = Router();

// TODO : For test purposes , will be removed later.
type TestUploadResponse = {
  cloudUrl: string;
  publicId: string;
  format: string;
  sizeKB: number;
};

fileRouter.post(
  "/test-upload",
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return next(new StorageError("NO_FILE"));
      }

      const result = await uploadToCloudinary(req.file);

      return sendSuccess<TestUploadResponse>(
        res,
        "File uploaded (test route)",
        {
          cloudUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          sizeKB: Math.ceil(result.bytes / 1024),
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }
);

export { fileRouter };

import { serverConfig as scf } from "@/config/env.config.js";
import { StorageError } from "@/utils/StorageError.js";
import multer from "multer";

const apiStorage = multer.memoryStorage();

export const upload = multer({
  storage: apiStorage,
  limits: {
    fileSize: scf.MAX_FILE_SIZE_MB,
  },
  fileFilter: (_req, file, callback) => {
    if (scf.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new StorageError("UNSUPPORTED_FILE_TYPE", "Unsupported file format")
      );
    }
  },
});

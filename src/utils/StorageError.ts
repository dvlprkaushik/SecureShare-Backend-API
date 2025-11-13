export const ERROR_CODES = {
  // ---------- AUTH ----------
  AUTH_REQUIRED: {
    code: "AUTH_REQUIRED",
    message: "Authentication required",
    status: 401,
  },
  INVALID_TOKEN: {
    code: "INVALID_TOKEN",
    message: "Invalid or expired token",
    status: 401,
  },
  INVALID_CREDENTIALS: {
    code: "INVALID_CREDENTIALS",
    message: "Invalid email or password",
    status: 401,
  },
  ACCESS_DENIED: {
    code: "ACCESS_DENIED",
    message: "Access denied",
    status: 403,
  },
  PERMISSION_DENIED: {
    code: "PERMISSION_DENIED",
    message: "You don't have permission to access this resource",
    status: 403,
  },

  // ---------- USER ----------
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    message: "User not found",
    status: 404,
  },
  USER_ALREADY_EXISTS: {
    code: "USER_ALREADY_EXISTS",
    message: "User already exists",
    status: 409,
  },
  ACCOUNT_DISABLED: {
    code: "ACCOUNT_DISABLED",
    message: "Your account has been disabled",
    status: 403,
  },

  // ---------- VALIDATION ----------
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    message: "Invalid input data",
    status: 400,
  },

  // ---------- FILES / STORAGE ----------
  FILE_TOO_LARGE: {
    code: "FILE_TOO_LARGE",
    message: "File size exceeds limit",
    status: 413,
  },
  UNSUPPORTED_FILE_TYPE: {
    code: "UNSUPPORTED_FILE_TYPE",
    message: "Unsupported file format",
    status: 415,
  },
  FILE_NOT_FOUND: {
    code: "FILE_NOT_FOUND",
    message: "File not found",
    status: 404,
  },
  FOLDER_NOT_FOUND: {
    code: "FOLDER_NOT_FOUND",
    message: "Folder not found",
    status: 404,
  },
  UPLOAD_FAILED: {
    code: "UPLOAD_FAILED",
    message: "File upload failed",
    status: 500,
  },
  DELETE_FAILED: {
    code: "DELETE_FAILED",
    message: "File deletion failed",
    status: 500,
  },
  SHARE_EXPIRED: {
    code: "SHARE_EXPIRED",
    message: "Share link has expired",
    status: 410,
  },
  NO_FILE: {
    code: "NO_FILE",
    message: "File is required",
    status: 400,
  },
  // ---------- DATABASE ----------
  DATABASE_ERROR: {
    code: "DATABASE_ERROR",
    message: "Database operation failed",
    status: 500,
  },
  UNIQUE_CONSTRAINT_FAILED: {
    code: "UNIQUE_CONSTRAINT_FAILED",
    message: "Duplicate value violates unique constraint",
    status: 409,
  },
  RECORD_NOT_FOUND: {
    code: "RECORD_NOT_FOUND",
    message: "Requested record not found",
    status: 404,
  },

  // ---------- SERVER ----------
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    message: "Something went wrong",
    status: 500,
  },
} as const;


export type ErrorCodeKeys = keyof typeof ERROR_CODES;

export class StorageError extends Error {
  public statusCode: number;
  public errorCode: ErrorCodeKeys;
  constructor(errorKey: ErrorCodeKeys, customErrorMessage?: string) {
    const { code, message, status } = ERROR_CODES[errorKey];
    super(customErrorMessage || message);
    this.name = "StorageError";
    this.statusCode = status;
    this.errorCode = code;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

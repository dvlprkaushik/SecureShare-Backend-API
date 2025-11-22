import { Request, Response, NextFunction } from "express";
import { z } from "zod";

type ValidationSource = "body" | "params" | "query";

/**
 * PROBLEM WITH OLD APPROACH:
 * When using multiple validations on the same route (like validateParams + validateBody),
 * the second validation would completely overwrite req.validated, causing data loss.
 *
 * Example of the problem:
 * - First validation sets: req.validated = { fileId: 13 }
 * - Second validation overwrites: req.validated = { filename: "new" }
 * - Result: fileId is lost
 *
 * NEW APPROACH:
 * Store validated data in a structured format with separate keys for each source.
 * Structure: req.validated = { body: {...}, params: {...}, query: {...} }
 * This prevents overwriting and allows multiple validations to coexist.
 *
 * Usage in controllers:
 * const { fileId } = req.validated?.params as FileIdInput;
 * const { filename } = req.validated?.body as RenameFileInput;
 * const { mimeType } = req.validated?.query as QueryInput;
 *
 * Note: The validated property is extended globally in the express.d.ts declaration file present in types folder.
 */
export const validate = <T extends z.ZodType>(
  schema: T,
  source: ValidationSource = "body"
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const receivedData =
      source === "body"
        ? req.body
        : source === "params"
          ? req.params
          : req.query;

    const validatedData = schema.safeParse(receivedData);

    if (!validatedData.success) {
      return next(validatedData.error);
    }

    // OLD APPROACH (caused overwriting):
    // (req as Request & { validated: z.infer<T> }).validated = validatedData.data;

    // NEW APPROACH (preserves all validated data):
    // Initialize validated object if it doesn't exist
    req.validated = req.validated || {};

    // Storing validated data under its source key to prevent overwriting
    req.validated[source] = validatedData.data;

    next();
  };
};

/**
 * Validates request body against a Zod schema.
 * Access in controller: req.validated?.body
 */
export const validateBody = <T extends z.ZodType>(schema: T) =>
  validate(schema, "body");

export const validateParams = <T extends z.ZodType>(schema: T) =>
  validate(schema, "params");

export const validateQuery = <T extends z.ZodType>(schema: T) =>
  validate(schema, "query");

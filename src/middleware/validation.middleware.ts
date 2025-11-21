import { Request, Response, NextFunction } from "express";
import { z } from "zod";

type ValidationSource = "body" | "params" | "query";

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

    /**
     * Type assertion needed: req.validated loses its specific type when
     * passing through middleware chain. The z.infer<T> type from validation
     * middleware doesn't propagate to controllers, so we explicitly cast it in controllers.
     *
     * @example const { email, password } = req.validated as LoginInput;
     */
    (req as Request & { validated: z.infer<T> }).validated = validatedData.data;

    next();
  };
};

export const validateBody = <T extends z.ZodType>(schema: T) =>
  validate(schema, "body");
export const validateParams = <T extends z.ZodType>(schema: T) =>
  validate(schema, "params");
export const validateQuery = <T extends z.ZodType>(schema: T) =>
  validate(schema, "query");

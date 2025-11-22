import "express";

declare global {
  namespace Express {
    interface Request {
      userId: number;
      validated?: {
        body?: any;
        params?: any;
        query?: any;
      };
    }
  }
}

export { };

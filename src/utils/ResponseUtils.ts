import { Response } from "express";

export const sendHeader = (res: Response, token: string) => {
  res.setHeader("Authorization", `Bearer ${token}`);
};

export const sendSuccess = <T>(
  res: Response,
  message: string = "Success",
  data : T,
  status: number = 200
) => {
  const responseBody: any = {
    success: true,
    statusCode: status,
    message,
    timestamp: new Date(),
  };

  if (data !== undefined) {
    responseBody.data = data;
  }

  return res.status(status).json(responseBody);
};

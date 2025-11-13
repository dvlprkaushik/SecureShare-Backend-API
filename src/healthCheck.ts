import { Application, Request, Response } from "express";
import pkg from "../package.json" with {type: 'json'};
export {pkg};

export const healthRoutes = (app : Application) =>{
  // Health check route
  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "OK",
      message: "Server is running 🚀",
      time : new Date().toISOString()
    });
  });

  // Info route from package.json
  app.get("/info", (_req: Request, res: Response) => {
    res.status(200).json({
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      author: pkg.author,
      repository: pkg.repository?.url.split("+")[1] || "N/A",
      license: pkg.license,
    });
  });
}

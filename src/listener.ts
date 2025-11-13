import chalk from "chalk";
import { Application } from "express";
import { pkg } from "./healthCheck.js";
import { serverConfig as scf } from "./config/env.config.js";

const PORT = scf.PORT || 5000;
export const listener = (app: Application) => {
  app.listen(PORT, () => {
    if (scf.NODE_ENV === "development") {
      console.log(
        chalk.green.bold(`Server running on http://localhost:${PORT}`)
      );
      console.log(chalk.cyan(`📦 Project: ${pkg.name} | v${pkg.version}`));
    }
  });
};

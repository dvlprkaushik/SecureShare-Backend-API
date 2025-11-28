import { S3Client } from "@aws-sdk/client-s3";
import { serverConfig as scf } from "./env.config.js";

export const s3 = new S3Client({
  region: scf.AWS_REGION,
  credentials: {
    accessKeyId: scf.S3_ACCESS_KEY,
    secretAccessKey: scf.S3_SECRET_KEY,
  },
  forcePathStyle : false
});

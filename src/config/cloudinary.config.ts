import { v2 as cloudinary } from "cloudinary";
import { serverConfig as scf } from "./env.config.js";

cloudinary.config({
  cloud_name: scf.CLOUDINARY_CLOUD_NAME,
  api_key: scf.CLOUDINARY_API_KEY,
  api_secret: scf.CLOUDINARY_API_SECRET,
  secure : true
});
export default cloudinary;

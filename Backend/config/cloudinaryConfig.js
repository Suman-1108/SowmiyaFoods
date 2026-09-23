import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "qnbhfeck",
  api_key: process.env.CLOUDINARY_API_KEY || "566811116316332",
  api_secret: process.env.CLOUDINARY_API_SECRET || "LMvuSFAZraT5Ks8lo9uMP-hJboc",
  secure: true,
});

export default cloudinary;

import multer from "multer";
import cloudinary from "../config/cloudinary";
// @ts-ignore
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req: any, file: any) => {
    return {
      folder: "ecommerce/products",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

const upload = multer({ storage });

export default upload;
import multer from "multer";
import cloudinary from "../config/cloudinary";
// @ts-ignore
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    console.log("Middlewares Upload File to Cloudinary starting for:", file.originalname);
    return {
      folder: "ecommerce/products",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({ storage });

export default upload;
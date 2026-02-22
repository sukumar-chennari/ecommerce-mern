import multer from "multer";
import cloudinary from "../config/cloudinary";
import CloudinaryStorage from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "ecommerce/products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  }),
});

const upload = multer({ storage });

export default upload;
declare module "multer-storage-cloudinary" {
    import { StorageEngine } from "multer";
    import { v2 as cloudinary } from "cloudinary";

    interface CloudinaryStorageOptions {
        cloudinary: typeof cloudinary;
        params?: any;
    }

    class CloudinaryStorage implements StorageEngine {
        constructor(options: CloudinaryStorageOptions);
        _handleFile(req: any, file: any, cb: any): void;
        _removeFile(req: any, file: any, cb: any): void;
    }

    export = CloudinaryStorage;
}
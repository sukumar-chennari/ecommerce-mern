import { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import Product from "../models/Product.model";
import cloudinary from "../config/cloudinary";
import { getPublicIdFromUrl } from "../utils/cloudinary.util";
import Order from "../models/Order.model";
import { ApiResponse } from "../utils/response.util";

// ─── Helpers ──────────────────────────────────────────────────────────

/** Safely delete an array of Cloudinary images (best-effort, never throws) */
async function deleteCloudinaryImages(urls: string[]): Promise<void> {
  for (const url of urls) {
    try {
      const publicId = getPublicIdFromUrl(url);
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error(`[Cloudinary] Failed to delete ${url}:`, err);
    }
  }
}

/** Extract uploaded file URLs from multer/cloudinary middleware */
function getUploadedUrls(req: Request): string[] {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) return [];

  // Debug: log all properties on the file objects from multer
  files.forEach((f: any, i) => {
    console.log(`[Upload Debug] File ${i}:`, {
      path: f.path,
      filename: f.filename,
      secure_url: f.secure_url,
      url: f.url,
      originalname: f.originalname,
    });
  });

  return files.map((f: any) => f.path);
}

// ─── Zod Schemas ──────────────────────────────────────────────────────

const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  stock: z.coerce.number().int().nonnegative("Stock must be >= 0"),
});

const updateProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().positive().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  // JSON stringified array of Cloudinary URLs the admin chose to KEEP
  existingImages: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════════════════
// GET /admin/products
// ═══════════════════════════════════════════════════════════════════════
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    return ApiResponse.success(res, "Products fetched", { products });
  } catch (err) {
    console.error("getProducts error:", err);
    return ApiResponse.error(res, "Server error", err);
  }
};

// ═══════════════════════════════════════════════════════════════════════
// POST /admin/products  — CREATE
// ═══════════════════════════════════════════════════════════════════════
export const createProduct = async (req: Request, res: Response) => {
  // At this point multer has already uploaded files to Cloudinary.
  // If validation fails we must clean up those uploads.
  const uploadedImages = getUploadedUrls(req);

  try {
    const parsed = createProductSchema.safeParse(req.body);

    if (!parsed.success) {
      // Validation failed → clean up already-uploaded images
      await deleteCloudinaryImages(uploadedImages);
      return ApiResponse.error(res, "Validation failed", parsed.error.flatten(), 400);
    }

    const product = await Product.create({
      ...parsed.data,
      images: uploadedImages,
    });

    return ApiResponse.success(res, "Product created", { product }, 201);
  } catch (err) {
    // DB save failed → clean up already-uploaded images
    await deleteCloudinaryImages(uploadedImages);
    console.error("createProduct error:", err);
    return ApiResponse.error(
      res,
      "Server error",
      err instanceof Error ? err.message : JSON.stringify(err),
      500
    );
  }
};

// ═══════════════════════════════════════════════════════════════════════
// PUT /admin/products/:productId  — UPDATE
//
// Frontend sends:
//   • existingImages  →  JSON string of URLs to KEEP  (text field)
//   • images          →  new File uploads              (binary, via multer)
//
// Reliability guarantees:
//   1. If DB update fails, newly uploaded images are cleaned from Cloudinary.
//   2. Old images that were removed by the admin are cleaned from Cloudinary
//      only AFTER the DB update succeeds.
//   3. Cloudinary cleanup errors are logged but never crash the request.
// ═══════════════════════════════════════════════════════════════════════
export const updateProduct = async (req: Request, res: Response) => {
  // New files already uploaded to Cloudinary by multer middleware
  const uploadedImages = getUploadedUrls(req);

  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      await deleteCloudinaryImages(uploadedImages);
      return ApiResponse.error(res, "Invalid product ID", null, 400);
    }

    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      await deleteCloudinaryImages(uploadedImages);
      return ApiResponse.error(res, "Validation failed", parsed.error.flatten(), 400);
    }

    // ── Fetch old product ──────────────────────────────────────────
    const oldProduct = await Product.findById(productId);
    if (!oldProduct) {
      await deleteCloudinaryImages(uploadedImages);
      return ApiResponse.error(res, "Product not found", null, 404);
    }

    // ── Determine final image list ─────────────────────────────────
    // Parse the JSON string of URLs the admin chose to keep
    let keptImages: string[] = [];
    if (parsed.data.existingImages) {
      try {
        const arr = JSON.parse(parsed.data.existingImages);
        keptImages = Array.isArray(arr) ? arr : [];
      } catch {
        keptImages = [];
      }
    }

    // Merge:  kept old URLs  +  newly uploaded URLs
    const finalImages = [...keptImages, ...uploadedImages];

    console.log("[Update Debug] Old images:", oldProduct.images);
    console.log("[Update Debug] Kept images:", keptImages);
    console.log("[Update Debug] Uploaded images:", uploadedImages);
    console.log("[Update Debug] Final images:", finalImages);

    // ── Build update payload ───────────────────────────────────────
    const { existingImages: _, ...fieldsToUpdate } = parsed.data;
    const updateData: any = {
      ...fieldsToUpdate,
      images: finalImages,
    };

    // ── Persist to DB ──────────────────────────────────────────────
    let updatedProduct;
    try {
      updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true }
      );
    } catch (err) {
      // DB failed → rollback Cloudinary uploads
      await deleteCloudinaryImages(uploadedImages);
      throw err;
    }

    if (!updatedProduct) {
      await deleteCloudinaryImages(uploadedImages);
      return ApiResponse.error(res, "Product update failed", null, 500);
    }

    // ── Clean up removed images from Cloudinary (best-effort) ──────
    const removedImages = (oldProduct.images || []).filter(
      (url: string) => !keptImages.includes(url)
    );
    if (removedImages.length > 0) {
      // Fire-and-forget: don't let Cloudinary cleanup block the response
      deleteCloudinaryImages(removedImages);
    }

    return ApiResponse.success(res, "Product updated", { product: updatedProduct });
  } catch (err) {
    console.error("updateProduct error:", err);
    return ApiResponse.error(res, "Server error", err);
  }
};

// ═══════════════════════════════════════════════════════════════════════
// DELETE /admin/products/:productId  — DELETE
//
// If the product has existing orders it is soft-deleted (isActive=false).
// Otherwise it is hard-deleted and all Cloudinary images are removed.
// ═══════════════════════════════════════════════════════════════════════
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return ApiResponse.error(res, "Invalid product ID", null, 400);
    }

    // Check for existing orders referencing this product
    const hasOrders = await Order.exists({ "items.productId": productId });

    if (hasOrders) {
      // Soft-delete: keep images in Cloudinary for order history
      await Product.findByIdAndUpdate(productId, { isActive: false });
      return ApiResponse.success(res, "Product archived (existing orders found)");
    }

    // Hard-delete
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return ApiResponse.error(res, "Product not found", null, 404);
    }

    // Clean up ALL images from Cloudinary (best-effort, non-blocking)
    if (product.images?.length) {
      deleteCloudinaryImages(product.images);
    }

    return ApiResponse.success(res, "Product deleted");
  } catch (err) {
    console.error("deleteProduct error:", err);
    return ApiResponse.error(res, "Server error", err);
  }
};
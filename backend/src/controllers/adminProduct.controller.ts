import { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import Product from "../models/Product.model";
import { Multer } from "multer";

import cloudinary from "../config/cloudinary";
import { getPublicIdFromUrl } from "../utils/cloudinary.util";
import Order from "../models/Order.model";



// Define a custom request type
interface MulterRequest extends Request {
  files?: Express.Multer.File[];
}

export const createProduct = async (req: Request, res: Response) => {
  console.log("createProduct req.body:", req.body);
  try {
    // Zod Schema for Create Product
    const createProductSchema = z.object({
      name: z.string().min(1, "Name is required"),
      description: z.string().min(1, "Description is required"),
      price: z.coerce.number().positive("Price must be positive"),
      category: z.string().min(1, "Category is required"),
      brand: z.string().min(1, "Brand is required"),
      stock: z.coerce.number().int().nonnegative("Stock must be a non-negative integer"),
    });

    const parsed = createProductSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    const {
      name,
      description,
      price,
      category,
      brand,
      stock,
    } = parsed.data;

    const images = ((req as MulterRequest).files)?.map(
      (file) => file.path
    ) || [];

    const product = await Product.create({
      name,
      description,
      price,
      category,
      brand,
      stock,
      images,
    });
    console.log("createProduct images:", images);
    return res.status(201).json({
      message: "Product created",
      product,
    });
  } catch (err) {
    console.error("createProduct error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err instanceof Error ? err.message : JSON.stringify(err)
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const updateProductSchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.coerce.number().positive().optional(),
      category: z.string().optional(),
      brand: z.string().optional(),
      stock: z.coerce.number().int().nonnegative().optional(),
    });

    const parsed = updateProductSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const images = (req.files as Express.Multer.File[] | undefined)?.map(
      (file) => file.path
    );

    const updateData: any = { ...req.body };

    if (images && images.length > 0) {
      updateData.images = images;
    }


    const product = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );



    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (images && images.length > 0 && product.images?.length) {
      for (const imageUrl of product.images) {
        console.log("Deleting image from Cloudinary:", imageUrl);
        const publicId = getPublicIdFromUrl(imageUrl);
        await cloudinary.uploader.destroy(publicId);
      }
    }
    return res.json({
      message: "Product updated",
      product,
    });
  } catch (err) {
    console.error("updateProduct error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;




    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const hasOrders = await Order.exists({
      "items.productId": productId,
    });

    if (hasOrders) {
      await Product.findByIdAndUpdate(productId, {
        isActive: false,
      });

      return res.json({
        message: "Product archived (existing orders found)",
      });
    }

    const product = await Product.findByIdAndDelete(productId);


    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.images?.length) {
      for (const imageUrl of product.images) {
        const publicId = getPublicIdFromUrl(imageUrl);
        await cloudinary.uploader.destroy(publicId);
      }
    }


    return res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("deleteProduct error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
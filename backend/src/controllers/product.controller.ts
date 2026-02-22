import type { Request, Response } from "express";
import { z } from "zod";
import Product from "../models/Product.model";
import { ApiResponse } from "../utils/response.util";

// export const createProduct = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.create(req.body);
//     return res.status(201).json(product);
//   } catch (err) {
//     return res.status(500).json({ message: "Server error", error: err });
//   }
// };

// Helper: parse query param that may be string or string[]
const toArray = (q: string | string[] | undefined): string[] | undefined =>
  q === undefined ? undefined : Array.isArray(q) ? q : q.split(",").map(s => s.trim()).filter(Boolean);



export const createProduct = async (req: Request, res: Response) => {
  try {
    const createProductSchema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      price: z.number().positive(),
      category: z.string().optional(),
      brand: z.string().optional(),
      stock: z.number().int().nonnegative().optional(),
      images: z.array(z.string()).optional(),
    });

    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return ApiResponse.error(res, "Validation failed", parsed.error.flatten(), 400);
    }

    const product = new Product(parsed.data);
    await product.save(); // ensures pre('save') runs
    return ApiResponse.success(res, "Product created", product, 201);
  } catch (err) {
    return ApiResponse.error(res, "Server error", err);
  }
};


export const getAllProducts = async (req: Request, res: Response) => {
  try {
    // Query params
    const {
      search,
      minPrice,
      maxPrice,
      sort,
    } = req.query as { [key: string]: string | undefined };

    // page & limit (pagination)
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 12)); // limit cap 100
    const skip = (page - 1) * limit;

    // Multiple-select filters (brand, category, color etc.)
    // Accepts repeated params (?brand=Nike&brand=Adidas) or comma-separated (?brand=Nike,Adidas)
    const brand = toArray(req.query.brand as any);
    const category = toArray(req.query.category as any);
    const color = toArray(req.query.color as any); // example additional filter

    // Build MongoDB query object
    const mongoQuery: any = {};

    // Search: simple (name OR description) using case-insensitive regex
    if (typeof search === "string" && search.trim()) {
      mongoQuery.$text = { $search: search.trim() };
      // const s = search.trim();
      // mongoQuery.$or = [
      //   { name: { $regex: s, $options: "i" } },
      //   { description: { $regex: s, $options: "i" } }
      // ];
      // OPTIONAL: if you later add text index, you might replace this with $text query
    }

    // Brand multi-select
    if (brand && brand.length) {
      mongoQuery.brand = { $in: brand };
    }

    // Category multi-select
    if (category && category.length) {
      mongoQuery.category = { $in: category };
    }

    // Example: color multi-select
    if (color && color.length) {
      mongoQuery["attributes.color"] = { $in: color }; // if you store attributes.color
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      mongoQuery.price = {};
      if (minPrice !== undefined) mongoQuery.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) mongoQuery.price.$lte = Number(maxPrice);
      // Remove price if empty
      if (Object.keys(mongoQuery.price).length === 0) delete mongoQuery.price;
    }

    // Stock filter example (only in-stock)
    if (req.query.inStock === "true") {
      mongoQuery.stock = { $gt: 0 };
    }

    // Sorting
    // Supported values: 'price_asc', 'price_desc', 'newest', 'oldest'
    let sortObj: any = { createdAt: -1 }; // default newest first
    if (sort === "price_asc") sortObj = { price: 1 };
    else if (sort === "price_desc") sortObj = { price: -1 };
    else if (sort === "oldest") sortObj = { createdAt: 1 };
    // you can add more sorts (rating, popularity) later

    // Execute queries: total count + page items
    const [totalProducts, products] = await Promise.all([
      Product.countDocuments(mongoQuery),

      //      await Product.find(mongoQuery, { score: { $meta: "textScore" } })
      // .sort({ score: { $meta: "textScore" }, ...sortObj })
      // .skip(skip)
      // .limit(limit)
      // .lean()
      Product.find(mongoQuery)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    return ApiResponse.success(res, "Products retrieved successfully", {
      products,
      page,
      limit,
      totalProducts,
      totalPages,
    });
  } catch (err) {
    console.error("getAllProducts error:", err);
    return ApiResponse.error(res, "Server error", err);
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (!slug) return ApiResponse.error(res, "Missing product slug", null, 400);
  try {
    const product = await Product.findOne({ slug });
    if (!product) return ApiResponse.error(res, "Product not found", null, 404);
    return ApiResponse.success(res, "Product retrieved", product);
  } catch {
    return ApiResponse.error(res, "Server error");
  }
};

export const updateProductById = async (req: Request, res: Response) => {
  try {
    const updateProductSchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.number().positive().optional(),
      category: z.string().optional(),
      brand: z.string().optional(),
      stock: z.number().int().nonnegative().optional(),
      images: z.array(z.string()).optional(),
    });

    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return ApiResponse.error(res, "Validation failed", parsed.error.flatten(), 400);
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      parsed.data,
      { new: true }
    );

    if (!updated) {
      return ApiResponse.error(res, "Product not found", null, 404);
    }

    return ApiResponse.success(res, "Product updated", updated);
  } catch {
    return ApiResponse.error(res, "Server error");
  }
};


export const deleteProductById = async (req: Request, res: Response) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return ApiResponse.error(res, "Product not found", null, 404);
    }

    return ApiResponse.success(res, "Product deleted");
  } catch {
    return ApiResponse.error(res, "Server error");
  }
};

// export const updateProduct = async (req: Request, res: Response) => {
//   const { slug } = req.params;
//   if (!slug) return res.status(400).json({ message: "Missing product slug" });
//   try {
//     const updated = await Product.findOneAndUpdate(
//       { slug },
//       req.body,
//       { new: true }
//     );
//     return res.json(updated);
//   } catch {
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// export const deleteProduct = async (req: Request, res: Response) => {
//   const { slug } = req.params;
//   if (!slug) return res.status(400).json({ message: "Missing product slug" });
//   try {
//     await Product.findOneAndDelete({ slug });
//     return res.status(204).send();
//   } catch {
//     return res.status(500).json({ message: "Server error" });
//   }
// };
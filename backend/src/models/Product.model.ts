import mongoose, { Document, Schema } from "mongoose";
import slugify from "slugify";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  stock: number;
  images: string[];
  slug: string;
  createdAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },

    description: { type: String, required: true },

    price: { type: Number, required: true, min: 0 },

    category: { type: String, required: true },

    brand: { type: String },

    stock: { type: Number, required: true, min: 0 },

    images: { type: [String], default: [] },

    slug: { type: String, unique: true, },
  },
  { timestamps: true }
);

// text index for advanced search (optional, see below)
productSchema.index({ name: "text", description: "text" });

// indexes for frequent filters / sorts
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ slug: 1 }, { unique: true });

// --- FIXED VERSION ---
// Add "async" here and remove the 'next' parameter/call
productSchema.pre("save", async function (this: IProduct) {
  if (this.isModified("name")) {
    // You can safely use await here if slugify was async, otherwise just assign
    this.slug = slugify(this.name, { lower: true });
  }
  // No next() call needed for async middleware
});

// // FIXED VERSION
// productSchema.pre("save", function (this: IProduct, next) {
//   if (this.isModified("name")) {
//     this.slug = slugify.default(this.name, { lower: true });
//   }
//   next();
// });

// productSchema.pre("save", function (next) {
//   if (this.isModified("name")) {
//     this.slug = slugify.default(this.name, { lower: true });
//   }
//   next();
// });

export default mongoose.model<IProduct>("Product", productSchema);
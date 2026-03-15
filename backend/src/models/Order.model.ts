import mongoose, { Document, Schema } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  // any other snapshot fields: variant, sku, etc.
}


export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;

  status: "pending" | "paid" | "cancelled" | "failed" | "refunded" | "shipped" | "delivered";

  shippingAddress?: {
    name?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  payment?: {
    method?: string;
    stripePaymentIntentId?: string | null;
    paidAt?: Date | null;
    raw?: any;
  };

  // Optional timestamps for lifecycle
  shippedAt?: Date;
  deliveredAt?: Date;

  // Timeline
  statusTimeline?: {
    orderedAt?: Date;
    paidAt?: Date;
    shippedAt?: Date;
    deliveredAt?: Date;
  };

  tracking?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  };

  deliveryEstimate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "shipped",
        "delivered",
        "cancelled",
        "failed",
        "refunded",
      ],
      default: "pending",
    },
    shippingAddress: {
      name: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    deliveredAt: { type: Date },
    shippedAt: { type: Date },
    payment: {
      method: { type: String, default: "stripe" },
      stripePaymentIntentId: String,
      paidAt: Date
    },
    tracking: {
      carrier: String,
      trackingNumber: String,
      trackingUrl: String,
    },
    statusTimeline: {
      orderedAt: { type: Date },
      paidAt: { type: Date },
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
    },
    deliveryEstimate: Date,
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1 });
// For revenue & order analytics
OrderSchema.index({ status: 1, createdAt: 1 });

// For order history (user side)
OrderSchema.index({ userId: 1, createdAt: -1 });

// For product analytics (items.productId used in unwind)
OrderSchema.index({ "items.productId": 1 });

export default mongoose.model<IOrder>("Order", OrderSchema);
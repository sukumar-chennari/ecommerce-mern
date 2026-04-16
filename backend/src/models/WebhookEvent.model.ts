import mongoose, { Document, Schema } from "mongoose";

export interface IWebhookEvent extends Document {
  eventId: string;
  type: string;
  status: "processing" | "success" | "failed";
  processedAt?: Date;
  raw: any;
  error?: string;
  retryCount?: number;
}

const WebhookEventSchema = new Schema<IWebhookEvent>({
  eventId: { type: String, required: true, unique: true, index: true },
  type: { type: String, required: true },

  status: {
    type: String,
    enum: ["processing", "success", "failed"],
    default: "processing",
  },

  processedAt: { type: Date },

  raw: { type: Schema.Types.Mixed },

  error: { type: String },

  retryCount: { type: Number, default: 0 },
});

export default mongoose.model<IWebhookEvent>(
  "WebhookEvent",
  WebhookEventSchema
);
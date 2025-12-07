import mongoose, { Document, Schema } from "mongoose";

export interface IWebhookEvent extends Document {
  eventId: string;
  processedAt: Date;
  raw: any;
  error?: string;
}

const WebhookEventSchema = new Schema<IWebhookEvent>({
  eventId: { type: String, required: true, unique: true, index: true },
  processedAt: { type: Date, required: true },
  raw: { type: Schema.Types.Mixed },
  error: { type: String }
});

export default mongoose.model<IWebhookEvent>("WebhookEvent", WebhookEventSchema);
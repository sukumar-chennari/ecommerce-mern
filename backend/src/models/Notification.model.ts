import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
    userId?: mongoose.Types.ObjectId;
    type: "order_paid" | "order_refunded" | "order_shipped";
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        type: { type: String, required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model<INotification>(
    "Notification",
    NotificationSchema
);
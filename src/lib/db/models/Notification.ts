import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  recipientUserId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type:
    | "EMERGENCY_ALERT"
    | "VOLUNTEER_ASSIGNMENT"
    | "STATUS_UPDATE"
    | "VOLUNTEER_VERIFICATION"
    | "ADOPTION_UPDATE"
    | "DONATION_RECEIPT"
    | "FEEDING_ALERT"
    | "SYSTEM";
  incidentId?: mongoose.Types.ObjectId;
  link?: string;
  isRead: boolean;
  readAt?: Date;
  priority: "HIGH" | "NORMAL" | "LOW";
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "EMERGENCY_ALERT",
        "VOLUNTEER_ASSIGNMENT",
        "STATUS_UPDATE",
        "VOLUNTEER_VERIFICATION",
        "ADOPTION_UPDATE",
        "DONATION_RECEIPT",
        "FEEDING_ALERT",
        "SYSTEM",
      ],
      default: "SYSTEM",
    },
    incidentId: { type: Schema.Types.ObjectId, ref: "Incident" },
    link: { type: String },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    priority: { type: String, enum: ["HIGH", "NORMAL", "LOW"], default: "NORMAL" },
  },
  { timestamps: true }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;

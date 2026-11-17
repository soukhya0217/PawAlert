import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmailLog extends Document {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  templateName: string;
  payload: Record<string, any>;
  status: "SENT" | "MOCKED" | "FAILED" | "PENDING";
  providerMessageId?: string;
  error?: string;
  retries: number;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    recipientEmail: { type: String, required: true, index: true },
    recipientName: { type: String },
    subject: { type: String, required: true },
    templateName: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["SENT", "MOCKED", "FAILED", "PENDING"],
      default: "SENT",
    },
    providerMessageId: { type: String },
    error: { type: String },
    retries: { type: Number, default: 0 },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

EmailLogSchema.index({ createdAt: -1 });

export const EmailLog: Model<IEmailLog> =
  mongoose.models.EmailLog || mongoose.model<IEmailLog>("EmailLog", EmailLogSchema);

export default EmailLog;

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDonation extends Document {
  receiptNumber: string; // e.g. REC-2026-0001
  donorUserId?: mongoose.Types.ObjectId;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  panNumber?: string;
  isAnonymous: boolean;
  amount: number;
  currency: string;
  campaignTitle: string;
  category: "EMERGENCY_MEDICAL" | "FEEDING_DRIVE" | "SHELTER_MAINTENANCE" | "AMBULANCE_FUEL" | "GENERAL_WELFARE";
  paymentGateway: "MOCK_GATEWAY" | "RAZORPAY" | "STRIPE" | "UPI";
  paymentId: string;
  orderId?: string;
  paymentStatus: "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED";
  ngoId?: mongoose.Types.ObjectId;
  message?: string;
  isTaxExempt80G: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    receiptNumber: { type: String, required: true, unique: true },
    donorUserId: { type: Schema.Types.ObjectId, ref: "User" },
    donorName: { type: String, required: true },
    donorEmail: { type: String, required: true },
    donorPhone: { type: String },
    panNumber: { type: String },
    isAnonymous: { type: Boolean, default: false },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    campaignTitle: { type: String, default: "Critical Animal Rescue Fund" },
    category: {
      type: String,
      enum: ["EMERGENCY_MEDICAL", "FEEDING_DRIVE", "SHELTER_MAINTENANCE", "AMBULANCE_FUEL", "GENERAL_WELFARE"],
      default: "EMERGENCY_MEDICAL",
    },
    paymentGateway: {
      type: String,
      enum: ["MOCK_GATEWAY", "RAZORPAY", "STRIPE", "UPI"],
      default: "MOCK_GATEWAY",
    },
    paymentId: { type: String, required: true },
    orderId: { type: String },
    paymentStatus: {
      type: String,
      enum: ["COMPLETED", "PENDING", "FAILED", "REFUNDED"],
      default: "COMPLETED",
    },
    ngoId: { type: Schema.Types.ObjectId, ref: "NGO" },
    message: { type: String },
    isTaxExempt80G: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Donation: Model<IDonation> =
  mongoose.models.Donation || mongoose.model<IDonation>("Donation", DonationSchema);

export default Donation;

import mongoose, { Schema, Document, Model } from "mongoose";

export interface INGO extends Document {
  name: string;
  registrationNumber: string;
  email: string;
  phone: string;
  website?: string;
  location: {
    type: "Point";
    coordinates: [number, number];
    address: string;
    city: string;
  };
  logo?: string;
  description: string;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  adminUserId: mongoose.Types.ObjectId;
  serviceRadiusKm: number;
  shelterCapacity: number;
  currentShelterOccupancy: number;
  stats: {
    totalRescues: number;
    activeCases: number;
    volunteersCount: number;
  };
  donationAccount?: {
    upiId?: string;
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NGOSchema = new Schema<INGO>(
  {
    name: { type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        default: [77.5946, 12.9716],
      },
      address: { type: String, required: true },
      city: { type: String, required: true },
    },
    logo: {
      type: String,
      default: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=200&q=80",
    },
    description: { type: String, required: true },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "VERIFIED", // Verified by default for primary NGO
    },
    adminUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceRadiusKm: { type: Number, default: 25 },
    shelterCapacity: { type: Number, default: 50 },
    currentShelterOccupancy: { type: Number, default: 12 },
    stats: {
      totalRescues: { type: Number, default: 0 },
      activeCases: { type: Number, default: 0 },
      volunteersCount: { type: Number, default: 0 },
    },
    donationAccount: {
      upiId: { type: String },
      accountName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
    },
  },
  { timestamps: true }
);

NGOSchema.index({ "location.coordinates": "2dsphere" });

export const NGO: Model<INGO> =
  mongoose.models.NGO || mongoose.model<INGO>("NGO", NGOSchema);

export default NGO;

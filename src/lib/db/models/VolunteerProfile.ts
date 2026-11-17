import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVolunteerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  category: "GENERAL" | "MEDICAL" | "FOOD" | "RESCUE" | "SHELTER";
  status: "PENDING_VERIFICATION" | "APPROVED" | "REJECTED" | "SUSPENDED";
  skills: string[];
  serviceArea: {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
    radiusKm: number;
    address: string;
  };
  availability: "AVAILABLE" | "BUSY" | "OFFLINE";
  activeCasesCount: number;
  totalRescuesCompleted: number;
  experienceYears: number;
  idProofUrl?: string;
  vehicleType?: "TWO_WHEELER" | "FOUR_WHEELER" | "AMBULANCE" | "NONE";
  emergencyContact?: string;
  preferredAnimalTypes: string[];
  ngoAffiliationId?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerProfileSchema = new Schema<IVolunteerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    category: {
      type: String,
      enum: ["GENERAL", "MEDICAL", "FOOD", "RESCUE", "SHELTER"],
      default: "RESCUE",
    },
    status: {
      type: String,
      enum: ["PENDING_VERIFICATION", "APPROVED", "REJECTED", "SUSPENDED"],
      default: "PENDING_VERIFICATION",
    },
    skills: [{ type: String }],
    serviceArea: {
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
      radiusKm: { type: Number, default: 15 },
      address: { type: String, default: "City Center" },
    },
    availability: {
      type: String,
      enum: ["AVAILABLE", "BUSY", "OFFLINE"],
      default: "AVAILABLE",
    },
    activeCasesCount: { type: Number, default: 0 },
    totalRescuesCompleted: { type: Number, default: 0 },
    experienceYears: { type: Number, default: 1 },
    idProofUrl: { type: String },
    vehicleType: {
      type: String,
      enum: ["TWO_WHEELER", "FOUR_WHEELER", "AMBULANCE", "NONE"],
      default: "TWO_WHEELER",
    },
    emergencyContact: { type: String },
    preferredAnimalTypes: [{ type: String, default: ["Dog", "Cat"] }],
    ngoAffiliationId: { type: Schema.Types.ObjectId, ref: "NGO" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

VolunteerProfileSchema.index({ "serviceArea.coordinates": "2dsphere" });
VolunteerProfileSchema.index({ status: 1, availability: 1 });

export const VolunteerProfile: Model<IVolunteerProfile> =
  mongoose.models.VolunteerProfile ||
  mongoose.model<IVolunteerProfile>("VolunteerProfile", VolunteerProfileSchema);

export default VolunteerProfile;

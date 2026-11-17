import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVeterinarian extends Document {
  userId: mongoose.Types.ObjectId;
  clinicName: string;
  licenseNumber: string;
  qualifications: string[]; // BVSc & AH, MVSc Surgery, etc.
  yearsOfExperience: number;
  specialization: string[]; // Small Animal, Orthopedics, Avian, Critical Care
  location: {
    type: "Point";
    coordinates: [number, number];
    address: string;
    city: string;
  };
  contactPhone: string;
  isEmergencyAvailable: boolean;
  status: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED";
  consultationFeeFreeForRescues: boolean;
  assignedAnimalIds: mongoose.Types.ObjectId[];
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VeterinarianSchema = new Schema<IVeterinarian>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    clinicName: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    qualifications: [{ type: String }],
    yearsOfExperience: { type: Number, default: 3 },
    specialization: [{ type: String }],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        index: "2dsphere",
      },
      address: { type: String, required: true },
      city: { type: String, required: true },
    },
    contactPhone: { type: String, required: true },
    isEmergencyAvailable: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["PENDING_VERIFICATION", "VERIFIED", "REJECTED"],
      default: "VERIFIED",
    },
    consultationFeeFreeForRescues: { type: Boolean, default: true },
    assignedAnimalIds: [{ type: Schema.Types.ObjectId, ref: "Animal" }],
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Veterinarian: Model<IVeterinarian> =
  mongoose.models.Veterinarian ||
  mongoose.model<IVeterinarian>("Veterinarian", VeterinarianSchema);

export default Veterinarian;

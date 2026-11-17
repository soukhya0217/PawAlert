import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShelter extends Document {
  name: string;
  ngoId?: mongoose.Types.ObjectId;
  location: {
    type: "Point";
    coordinates: [number, number];
    address: string;
    city: string;
  };
  contactPhone: string;
  contactEmail: string;
  capacity: number;
  currentOccupancy: number;
  facilities: string[]; // Quarantine ward, Surgical room, Play area, Aviary
  operatingHours: string;
  images: string[];
  status: "OPEN" | "AT_CAPACITY" | "MAINTENANCE";
  createdAt: Date;
  updatedAt: Date;
}

const ShelterSchema = new Schema<IShelter>(
  {
    name: { type: String, required: true, trim: true },
    ngoId: { type: Schema.Types.ObjectId, ref: "NGO" },
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
    contactEmail: { type: String, required: true },
    capacity: { type: Number, default: 40 },
    currentOccupancy: { type: Number, default: 15 },
    facilities: [{ type: String }],
    operatingHours: { type: String, default: "08:00 AM - 08:00 PM" },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["OPEN", "AT_CAPACITY", "MAINTENANCE"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

export const Shelter: Model<IShelter> =
  mongoose.models.Shelter || mongoose.model<IShelter>("Shelter", ShelterSchema);

export default Shelter;

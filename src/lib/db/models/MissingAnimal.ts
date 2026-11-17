import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMissingAnimal extends Document {
  petName: string;
  species: string;
  breed?: string;
  color: string;
  gender: "Male" | "Female" | "Unknown";
  age?: string;
  distinctiveMarks?: string;
  collarDescription?: string;
  microchipNumber?: string;
  photos: string[];
  lastSeenLocation: {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
    address: string;
    city: string;
  };
  lostDate: Date;
  ownerUserId?: mongoose.Types.ObjectId;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  showPhonePublicly: boolean;
  rewardAmount?: number;
  status: "MISSING" | "SIGHTED" | "REUNITED" | "CLOSED";
  matchedIncidentId?: mongoose.Types.ObjectId;
  reunificationStory?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MissingAnimalSchema = new Schema<IMissingAnimal>(
  {
    petName: { type: String, required: true, trim: true },
    species: { type: String, required: true },
    breed: { type: String, default: "Mixed Breed" },
    color: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Unknown"], default: "Unknown" },
    age: { type: String },
    distinctiveMarks: { type: String },
    collarDescription: { type: String },
    microchipNumber: { type: String },
    photos: [{ type: String, required: true }],
    lastSeenLocation: {
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
    lostDate: { type: Date, required: true, default: Date.now },
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User" },
    ownerName: { type: String, required: true },
    ownerPhone: { type: String, required: true },
    ownerEmail: { type: String },
    showPhonePublicly: { type: Boolean, default: true },
    rewardAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["MISSING", "SIGHTED", "REUNITED", "CLOSED"],
      default: "MISSING",
    },
    matchedIncidentId: { type: Schema.Types.ObjectId, ref: "Incident" },
    reunificationStory: { type: String },
  },
  { timestamps: true }
);

export const MissingAnimal: Model<IMissingAnimal> =
  mongoose.models.MissingAnimal ||
  mongoose.model<IMissingAnimal>("MissingAnimal", MissingAnimalSchema);

export default MissingAnimal;

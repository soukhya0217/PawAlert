import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdoptionListing extends Document {
  animalId: mongoose.Types.ObjectId;
  title: string;
  name: string;
  species: string;
  breed: string;
  age: string; // e.g. "1.5 Years"
  gender: "Male" | "Female";
  size: "Small" | "Medium" | "Large";
  goodWithKids: boolean;
  goodWithOtherPets: boolean;
  isVaccinated: boolean;
  isNeutered: boolean;
  story: string;
  personalityTraits: string[]; // Playful, Calm, Affectionate, etc.
  photos: string[];
  location: string;
  ngoId?: mongoose.Types.ObjectId;
  status: "AVAILABLE" | "PENDING_ADOPTION" | "ADOPTED";
  applicationsCount: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdoptionListingSchema = new Schema<IAdoptionListing>(
  {
    animalId: { type: Schema.Types.ObjectId, ref: "Animal" },
    title: { type: String, required: true },
    name: { type: String, required: true },
    species: { type: String, required: true },
    breed: { type: String, default: "Rescue Mix" },
    age: { type: String, default: "1 Year" },
    gender: { type: String, enum: ["Male", "Female"], default: "Male" },
    size: { type: String, enum: ["Small", "Medium", "Large"], default: "Medium" },
    goodWithKids: { type: Boolean, default: true },
    goodWithOtherPets: { type: Boolean, default: true },
    isVaccinated: { type: Boolean, default: true },
    isNeutered: { type: Boolean, default: true },
    story: { type: String, required: true },
    personalityTraits: [{ type: String }],
    photos: [{ type: String, required: true }],
    location: { type: String, default: "Bangalore" },
    ngoId: { type: Schema.Types.ObjectId, ref: "NGO" },
    status: {
      type: String,
      enum: ["AVAILABLE", "PENDING_ADOPTION", "ADOPTED"],
      default: "AVAILABLE",
    },
    applicationsCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AdoptionListingSchema.index({ status: 1, species: 1 });

export const AdoptionListing: Model<IAdoptionListing> =
  mongoose.models.AdoptionListing ||
  mongoose.model<IAdoptionListing>("AdoptionListing", AdoptionListingSchema);

export default AdoptionListing;

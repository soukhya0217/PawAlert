import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnimal extends Document {
  name: string;
  species: string; // Dog, Cat, Bird, Cattle, etc.
  breed?: string;
  ageYears?: number;
  gender: "MALE" | "FEMALE" | "UNKNOWN";
  healthStatus: "CRITICAL" | "UNDER_TREATMENT" | "RECOVERED" | "HEALTHY" | "DECEASED";
  incidentId?: mongoose.Types.ObjectId;
  shelterId?: mongoose.Types.ObjectId;
  ngoId?: mongoose.Types.ObjectId;
  images: string[];
  intakeDate: Date;
  isVaccinated: boolean;
  isSterilized: boolean;
  microchipNumber?: string;
  specialNeeds?: string;
  adoptionStatus: "NOT_AVAILABLE" | "AVAILABLE" | "APPLICATION_PENDING" | "ADOPTED";
  createdAt: Date;
  updatedAt: Date;
}

const AnimalSchema = new Schema<IAnimal>(
  {
    name: { type: String, required: true, trim: true },
    species: { type: String, required: true, trim: true },
    breed: { type: String, default: "Mixed Breed" },
    ageYears: { type: Number, default: 2 },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "UNKNOWN"],
      default: "UNKNOWN",
    },
    healthStatus: {
      type: String,
      enum: ["CRITICAL", "UNDER_TREATMENT", "RECOVERED", "HEALTHY", "DECEASED"],
      default: "UNDER_TREATMENT",
    },
    incidentId: { type: Schema.Types.ObjectId, ref: "Incident" },
    shelterId: { type: Schema.Types.ObjectId, ref: "Shelter" },
    ngoId: { type: Schema.Types.ObjectId, ref: "NGO" },
    images: [{ type: String }],
    intakeDate: { type: Date, default: Date.now },
    isVaccinated: { type: Boolean, default: false },
    isSterilized: { type: Boolean, default: false },
    microchipNumber: { type: String },
    specialNeeds: { type: String },
    adoptionStatus: {
      type: String,
      enum: ["NOT_AVAILABLE", "AVAILABLE", "APPLICATION_PENDING", "ADOPTED"],
      default: "NOT_AVAILABLE",
    },
  },
  { timestamps: true }
);

export const Animal: Model<IAnimal> =
  mongoose.models.Animal || mongoose.model<IAnimal>("Animal", AnimalSchema);

export default Animal;

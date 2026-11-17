import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeedingZone extends Document {
  zoneName: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
    address: string;
    landmark?: string;
  };
  estimatedAnimalCount: number;
  speciesPresent: string[]; // Dog, Cat, Cattle, Birds
  hasWaterPoint: boolean;
  waterBowlCondition: "CLEAN" | "NEEDS_REFILL" | "DAMAGED" | "ABSENT";
  dailyFoodKg: number;
  foodType: string;
  feedingTimeSlots: string[]; // e.g. ["07:30 AM", "06:00 PM"]
  assignedVolunteerIds: mongoose.Types.ObjectId[];
  ngoId?: mongoose.Types.ObjectId;
  status: "ACTIVE" | "INACTIVE" | "NEEDS_VOLUNTEER";
  lastFedAt?: Date;
  lastWaterRefilledAt?: Date;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FeedingZoneSchema = new Schema<IFeedingZone>(
  {
    zoneName: { type: String, required: true, trim: true },
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
      landmark: { type: String },
    },
    estimatedAnimalCount: { type: Number, default: 5 },
    speciesPresent: [{ type: String, default: ["Dog"] }],
    hasWaterPoint: { type: Boolean, default: true },
    waterBowlCondition: {
      type: String,
      enum: ["CLEAN", "NEEDS_REFILL", "DAMAGED", "ABSENT"],
      default: "CLEAN",
    },
    dailyFoodKg: { type: Number, default: 3.5 },
    foodType: { type: String, default: "Kibble & Rice with Broth" },
    feedingTimeSlots: [{ type: String }],
    assignedVolunteerIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    ngoId: { type: Schema.Types.ObjectId, ref: "NGO" },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "NEEDS_VOLUNTEER"],
      default: "ACTIVE",
    },
    lastFedAt: { type: Date },
    lastWaterRefilledAt: { type: Date },
    photos: [{ type: String }],
  },
  { timestamps: true }
);

export const FeedingZone: Model<IFeedingZone> =
  mongoose.models.FeedingZone ||
  mongoose.model<IFeedingZone>("FeedingZone", FeedingZoneSchema);

export default FeedingZone;

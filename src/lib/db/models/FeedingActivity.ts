import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeedingActivity extends Document {
  zoneId: mongoose.Types.ObjectId;
  volunteerId: mongoose.Types.ObjectId;
  fedAt: Date;
  foodGivenKg: number;
  waterRefilledLiters: number;
  animalsCounted: number;
  proofPhotos: string[];
  notes?: string;
  isWaterBowlCleaned: boolean;
  unusualObservations?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedingActivitySchema = new Schema<IFeedingActivity>(
  {
    zoneId: { type: Schema.Types.ObjectId, ref: "FeedingZone", required: true },
    volunteerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fedAt: { type: Date, default: Date.now },
    foodGivenKg: { type: Number, required: true },
    waterRefilledLiters: { type: Number, default: 5 },
    animalsCounted: { type: Number, required: true },
    proofPhotos: [{ type: String }],
    notes: { type: String },
    isWaterBowlCleaned: { type: Boolean, default: true },
    unusualObservations: { type: String },
  },
  { timestamps: true }
);

FeedingActivitySchema.index({ zoneId: 1, fedAt: -1 });
FeedingActivitySchema.index({ volunteerId: 1 });

export const FeedingActivity: Model<IFeedingActivity> =
  mongoose.models.FeedingActivity ||
  mongoose.model<IFeedingActivity>("FeedingActivity", FeedingActivitySchema);

export default FeedingActivity;

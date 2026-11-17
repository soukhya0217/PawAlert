import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdoptionApplication extends Document {
  listingId: mongoose.Types.ObjectId;
  applicantUserId: mongoose.Types.ObjectId;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  address: string;
  city: string;
  homeType: "APARTMENT" | "INDEPENDENT_HOUSE" | "FARM_HOUSE" | "OTHER";
  ownershipType: "OWNED" | "RENTED";
  hasLandlordPermission?: boolean;
  hasOtherPets: boolean;
  petExperienceDetails: string;
  hoursPetAloneDaily: number;
  familyMembersCount: number;
  allFamilyMembersAgree: boolean;
  status: "SUBMITTED" | "REVIEWING" | "HOME_CHECK_SCHEDULED" | "APPROVED" | "REJECTED";
  ngoId?: mongoose.Types.ObjectId;
  reviewerNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdoptionApplicationSchema = new Schema<IAdoptionApplication>(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "AdoptionListing", required: true },
    applicantUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    applicantName: { type: String, required: true },
    applicantEmail: { type: String, required: true },
    applicantPhone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    homeType: {
      type: String,
      enum: ["APARTMENT", "INDEPENDENT_HOUSE", "FARM_HOUSE", "OTHER"],
      default: "APARTMENT",
    },
    ownershipType: {
      type: String,
      enum: ["OWNED", "RENTED"],
      default: "OWNED",
    },
    hasLandlordPermission: { type: Boolean, default: true },
    hasOtherPets: { type: Boolean, default: false },
    petExperienceDetails: { type: String, default: "Previously raised dogs" },
    hoursPetAloneDaily: { type: Number, default: 4 },
    familyMembersCount: { type: Number, default: 3 },
    allFamilyMembersAgree: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["SUBMITTED", "REVIEWING", "HOME_CHECK_SCHEDULED", "APPROVED", "REJECTED"],
      default: "SUBMITTED",
    },
    ngoId: { type: Schema.Types.ObjectId, ref: "NGO" },
    reviewerNotes: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export const AdoptionApplication: Model<IAdoptionApplication> =
  mongoose.models.AdoptionApplication ||
  mongoose.model<IAdoptionApplication>("AdoptionApplication", AdoptionApplicationSchema);

export default AdoptionApplication;

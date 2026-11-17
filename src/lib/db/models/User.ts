import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole =
  | "PUBLIC_USER"
  | "GENERAL_VOLUNTEER"
  | "MEDICAL_VOLUNTEER"
  | "FOOD_VOLUNTEER"
  | "RESCUE_VOLUNTEER"
  | "SHELTER_VOLUNTEER"
  | "VETERINARIAN"
  | "NGO_ADMIN"
  | "SUPER_ADMIN";

export interface IUser extends Document {
  fullName: string;
  email: string;
  mobile: string;
  passwordHash: string;
  city: string;
  address?: string;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  profileImage?: string;
  role: UserRole;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  ngoId?: mongoose.Types.ObjectId;
  activeVolunteerProfileId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.5946, 12.9716], // Default center (e.g. Bangalore)
      },
    },
    profileImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    },
    role: {
      type: String,
      enum: [
        "PUBLIC_USER",
        "GENERAL_VOLUNTEER",
        "MEDICAL_VOLUNTEER",
        "FOOD_VOLUNTEER",
        "RESCUE_VOLUNTEER",
        "SHELTER_VOLUNTEER",
        "VETERINARIAN",
        "NGO_ADMIN",
        "SUPER_ADMIN",
      ],
      default: "PUBLIC_USER",
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    ngoId: { type: Schema.Types.ObjectId, ref: "NGO" },
    activeVolunteerProfileId: { type: Schema.Types.ObjectId, ref: "VolunteerProfile" },
  },
  { timestamps: true }
);

UserSchema.index({ location: "2dsphere" });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRescueAssignment extends Document {
  incidentId: mongoose.Types.ObjectId;
  volunteerId: mongoose.Types.ObjectId;
  ngoId?: mongoose.Types.ObjectId;
  status: "OFFERED" | "ACCEPTED" | "DECLINED" | "REASSIGNED" | "EXPIRED" | "COMPLETED";
  offeredAt: Date;
  respondedAt?: Date;
  declineReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RescueAssignmentSchema = new Schema<IRescueAssignment>(
  {
    incidentId: { type: Schema.Types.ObjectId, ref: "Incident", required: true },
    volunteerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ngoId: { type: Schema.Types.ObjectId, ref: "NGO" },
    status: {
      type: String,
      enum: ["OFFERED", "ACCEPTED", "DECLINED", "REASSIGNED", "EXPIRED", "COMPLETED"],
      default: "ACCEPTED",
    },
    offeredAt: { type: Date, default: Date.now },
    respondedAt: { type: Date, default: Date.now },
    declineReason: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

RescueAssignmentSchema.index({ incidentId: 1, volunteerId: 1 });
RescueAssignmentSchema.index({ volunteerId: 1, status: 1 });

export const RescueAssignment: Model<IRescueAssignment> =
  mongoose.models.RescueAssignment ||
  mongoose.model<IRescueAssignment>("RescueAssignment", RescueAssignmentSchema);

export default RescueAssignment;

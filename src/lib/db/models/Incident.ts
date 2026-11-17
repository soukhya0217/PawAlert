import mongoose, { Schema, Document, Model } from "mongoose";

export type IncidentStatus =
  | "REPORTED"
  | "VERIFICATION_PENDING"
  | "VERIFIED"
  | "VOLUNTEER_ASSIGNED"
  | "VOLUNTEER_EN_ROUTE"
  | "VOLUNTEER_REACHED"
  | "RESCUE_IN_PROGRESS"
  | "ANIMAL_RESCUED"
  | "TREATMENT_STARTED"
  | "RECOVERY_MONITORING"
  | "RESOLVED"
  | "UNABLE_TO_COMPLETE";

export type IncidentPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface IStatusHistoryItem {
  status: IncidentStatus;
  timestamp: Date;
  updatedBy?: mongoose.Types.ObjectId;
  updaterRole?: string;
  notes?: string;
  evidenceImages?: string[];
  locationSnapshot?: [number, number];
}

export interface IIncident extends Document {
  incidentId: string; // e.g. PA-2026-000001
  animalCategory: string;
  conditionDescription: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
    address: string;
    landmark?: string;
    city: string;
  };
  images: string[];
  videoUrl?: string;
  reporterId?: mongoose.Types.ObjectId;
  reporterName: string;
  reporterPhone: string;
  reporterEmail?: string;
  assignedVolunteerId?: mongoose.Types.ObjectId;
  assignedVolunteerProfileId?: mongoose.Types.ObjectId;
  assignedNgoId?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  acceptedAt?: Date;
  enRouteAt?: Date;
  reachedAt?: Date;
  rescuedAt?: Date;
  resolvedAt?: Date;
  slaDeadline: Date;
  isEscalated: boolean;
  escalatedAt?: Date;
  statusHistory: IStatusHistoryItem[];
  resolutionNotes?: string;
  closureEvidence?: string[];
  vetNotes?: string;
  assignedVetId?: mongoose.Types.ObjectId;
  aiTriage?: {
    identifiedSpecies?: string;
    confidenceScore?: number;
    severityTag?: string;
    possibleDuplicateOf?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const IncidentSchema = new Schema<IIncident>(
  {
    incidentId: { type: String, required: true, unique: true, index: true },
    animalCategory: {
      type: String,
      required: true,
      enum: [
        "Injured Dog",
        "Injured Cat",
        "Injured Bird",
        "Road Accident",
        "Abandoned Animal",
        "Trapped Animal",
        "Sick Animal",
        "Starving Animal",
        "Animal Abuse",
        "Stray Cattle",
        "Wildlife Emergency",
        "Other",
      ],
    },
    conditionDescription: { type: String, required: true },
    priority: {
      type: String,
      enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      default: "HIGH",
    },
    status: {
      type: String,
      enum: [
        "REPORTED",
        "VERIFICATION_PENDING",
        "VERIFIED",
        "VOLUNTEER_ASSIGNED",
        "VOLUNTEER_EN_ROUTE",
        "VOLUNTEER_REACHED",
        "RESCUE_IN_PROGRESS",
        "ANIMAL_RESCUED",
        "TREATMENT_STARTED",
        "RECOVERY_MONITORING",
        "RESOLVED",
        "UNABLE_TO_COMPLETE",
      ],
      default: "REPORTED",
    },
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
      city: { type: String, required: true },
    },
    images: [{ type: String, required: true }],
    videoUrl: { type: String },
    reporterId: { type: Schema.Types.ObjectId, ref: "User" },
    reporterName: { type: String, required: true },
    reporterPhone: { type: String, required: true },
    reporterEmail: { type: String },
    assignedVolunteerId: { type: Schema.Types.ObjectId, ref: "User" },
    assignedVolunteerProfileId: { type: Schema.Types.ObjectId, ref: "VolunteerProfile" },
    assignedNgoId: { type: Schema.Types.ObjectId, ref: "NGO" },
    assignedAt: { type: Date },
    acceptedAt: { type: Date },
    enRouteAt: { type: Date },
    reachedAt: { type: Date },
    rescuedAt: { type: Date },
    resolvedAt: { type: Date },
    slaDeadline: { type: Date, required: true },
    isEscalated: { type: Boolean, default: false },
    escalatedAt: { type: Date },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
        updaterRole: { type: String },
        notes: { type: String },
        evidenceImages: [{ type: String }],
        locationSnapshot: [{ type: Number }],
      },
    ],
    resolutionNotes: { type: String },
    closureEvidence: [{ type: String }],
    vetNotes: { type: String },
    assignedVetId: { type: Schema.Types.ObjectId, ref: "User" },
    aiTriage: {
      identifiedSpecies: { type: String },
      confidenceScore: { type: Number },
      severityTag: { type: String },
      possibleDuplicateOf: { type: String },
    },
  },
  { timestamps: true }
);

IncidentSchema.index({ status: 1, priority: 1 });
IncidentSchema.index({ createdAt: -1 });

export const Incident: Model<IIncident> =
  mongoose.models.Incident || mongoose.model<IIncident>("Incident", IncidentSchema);

export default Incident;

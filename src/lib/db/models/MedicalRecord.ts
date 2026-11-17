import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMedicalRecord extends Document {
  animalId: mongoose.Types.ObjectId;
  incidentId?: mongoose.Types.ObjectId;
  vetId: mongoose.Types.ObjectId;
  clinicName: string;
  diagnosis: string;
  vitals?: {
    temperatureC?: number;
    weightKg?: number;
    heartRateBpm?: number;
  };
  prescriptions: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    instructions?: string;
  }>;
  surgeries: Array<{
    procedure: string;
    date: Date;
    notes?: string;
    surgeonName?: string;
  }>;
  vaccinations: Array<{
    vaccineName: string;
    administeredDate: Date;
    nextDueDate?: Date;
  }>;
  medicalImages: string[];
  followUpDate?: Date;
  treatmentProgress: "CRITICAL" | "GUARDED" | "IMPROVING" | "STABLE" | "FULLY_RECOVERED";
  generalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalRecordSchema = new Schema<IMedicalRecord>(
  {
    animalId: { type: Schema.Types.ObjectId, ref: "Animal", required: true },
    incidentId: { type: Schema.Types.ObjectId, ref: "Incident" },
    vetId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    clinicName: { type: String, required: true },
    diagnosis: { type: String, required: true },
    vitals: {
      temperatureC: { type: Number },
      weightKg: { type: Number },
      heartRateBpm: { type: Number },
    },
    prescriptions: [
      {
        medicineName: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        durationDays: { type: Number, required: true },
        instructions: { type: String },
      },
    ],
    surgeries: [
      {
        procedure: { type: String, required: true },
        date: { type: Date, default: Date.now },
        notes: { type: String },
        surgeonName: { type: String },
      },
    ],
    vaccinations: [
      {
        vaccineName: { type: String, required: true },
        administeredDate: { type: Date, default: Date.now },
        nextDueDate: { type: Date },
      },
    ],
    medicalImages: [{ type: String }],
    followUpDate: { type: Date },
    treatmentProgress: {
      type: String,
      enum: ["CRITICAL", "GUARDED", "IMPROVING", "STABLE", "FULLY_RECOVERED"],
      default: "IMPROVING",
    },
    generalNotes: { type: String },
  },
  { timestamps: true }
);

MedicalRecordSchema.index({ animalId: 1 });
MedicalRecordSchema.index({ vetId: 1 });

export const MedicalRecord: Model<IMedicalRecord> =
  mongoose.models.MedicalRecord ||
  mongoose.model<IMedicalRecord>("MedicalRecord", MedicalRecordSchema);

export default MedicalRecord;

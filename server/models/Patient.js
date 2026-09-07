const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
  {
    mrn: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    contactInfo: {
      phone: { type: String, required: true },
      email: { type: String },
      address: {
        street: String,
        city: String,
        state: String,
        zip: String,
      },
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      groupNumber: String,
      expiryDate: Date,
    },
    allergies: [
      {
        name: String,
        severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
      },
    ],
    medicalHistory: [
      {
        condition: String,
        diagnosedDate: Date,
        status: { type: String, enum: ['active', 'resolved', 'managed'] },
        notes: String,
      },
    ],
    currentMedications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        prescribedBy: String,
        startDate: Date,
      },
    ],
    vitals: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      weight: Number,
      height: Number,
      oxygenSaturation: Number,
      lastUpdated: Date,
    },
    assignedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
PatientSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
PatientSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
});

// Index for fast searches
PatientSchema.index({ firstName: 'text', lastName: 'text' });
PatientSchema.index({ 'contactInfo.phone': 1 });

module.exports = mongoose.model('Patient', PatientSchema);

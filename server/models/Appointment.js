const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
    },
    dateTime: {
      type: Date,
      required: [true, 'Appointment date and time is required'],
    },
    duration: {
      type: Number,
      default: 30, // minutes
    },
    type: {
      type: String,
      enum: ['consultation', 'follow-up', 'procedure', 'lab-test', 'emergency'],
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    reason: {
      type: String,
      required: [true, 'Reason for appointment is required'],
    },
    notes: {
      type: String,
    },
    roomNumber: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for calendar queries
AppointmentSchema.index({ dateTime: 1, doctor: 1 });
AppointmentSchema.index({ patient: 1, dateTime: -1 });
AppointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);

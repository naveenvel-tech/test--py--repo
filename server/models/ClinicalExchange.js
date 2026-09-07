const mongoose = require('mongoose');

const ClinicalExchangeSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    fromProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    toProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    documentType: {
      type: String,
      enum: ['lab-report', 'prescription', 'discharge-summary', 'imaging', 'referral'],
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    attachments: [
      {
        name: String,
        type: String,
        size: Number,
        url: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'sent', 'received', 'reviewed', 'rejected'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['routine', 'urgent', 'stat'],
      default: 'routine',
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sentAt: Date,
    receivedAt: Date,
    reviewedAt: Date,
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

ClinicalExchangeSchema.index({ status: 1 });
ClinicalExchangeSchema.index({ fromProvider: 1, toProvider: 1 });
ClinicalExchangeSchema.index({ patient: 1 });

module.exports = mongoose.model('ClinicalExchange', ClinicalExchangeSchema);

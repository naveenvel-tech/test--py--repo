const mongoose = require('mongoose');

const ProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Provider name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'lab', 'pharmacy', 'imaging-center'],
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    website: String,
    specialties: [String],
    operatingHours: {
      weekdays: { type: String, default: '08:00 - 18:00' },
      saturday: { type: String, default: '09:00 - 14:00' },
      sunday: { type: String, default: 'Closed' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    staffCount: {
      type: Number,
      default: 0,
    },
    description: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Provider', ProviderSchema);

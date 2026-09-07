const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: String,
    userRole: String,
    action: {
      type: String,
      enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXCHANGE', 'STATUS_CHANGE'],
      required: true,
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: String,
    },
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// TTL index — auto-delete after 365 days
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });
AuditLogSchema.index({ user: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ resource: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);

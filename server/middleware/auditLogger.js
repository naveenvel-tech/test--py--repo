const AuditLog = require('../models/AuditLog');

const auditLogger = (action, resource) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      // Only log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const logEntry = {
          user: req.user ? req.user._id : null,
          userName: req.user ? req.user.name : 'Anonymous',
          userRole: req.user ? req.user.role : 'none',
          action,
          resource,
          resourceId: req.params.id || (data && data.data && data.data._id) || null,
          details: `${action} on ${resource}${req.params.id ? ` (ID: ${req.params.id})` : ''}`,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
        };

        // Fire and forget — don't slow down the response
        AuditLog.create(logEntry).catch((err) =>
          console.error('Audit log error:', err.message)
        );
      }

      return originalJson(data);
    };

    next();
  };
};

module.exports = auditLogger;

const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs
// @route   GET /api/audit
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, resource, user, startDate, endDate, page = 1, limit = 30 } = req.query;

    let query = {};

    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (user) query.user = user;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      count: logs.length,
      total,
      pages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

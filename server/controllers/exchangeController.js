const ClinicalExchange = require('../models/ClinicalExchange');

// @desc    Get exchanges
// @route   GET /api/exchanges
exports.getExchanges = async (req, res) => {
  try {
    const { status, priority, documentType, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (documentType) query.documentType = documentType;

    const total = await ClinicalExchange.countDocuments(query);
    const exchanges = await ClinicalExchange.find(query)
      .populate('patient', 'firstName lastName mrn')
      .populate('fromProvider', 'name type')
      .populate('toProvider', 'name type')
      .populate('requestedBy', 'name role')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: exchanges.length,
      total,
      pages: Math.ceil(total / limit),
      data: exchanges,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create exchange
// @route   POST /api/exchanges
exports.createExchange = async (req, res) => {
  try {
    req.body.requestedBy = req.user._id;
    req.body.status = 'pending';
    req.body.sentAt = new Date();

    const exchange = await ClinicalExchange.create(req.body);

    const populated = await ClinicalExchange.findById(exchange._id)
      .populate('patient', 'firstName lastName mrn')
      .populate('fromProvider', 'name type')
      .populate('toProvider', 'name type')
      .populate('requestedBy', 'name role');

    // Real-time notification
    const io = req.app.get('io');
    io.emit('exchange:created', { exchange: populated });

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update exchange status
// @route   PUT /api/exchanges/:id/status
exports.updateExchangeStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const updateData = { status };

    if (status === 'received') updateData.receivedAt = new Date();
    if (status === 'reviewed') {
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = req.user._id;
    }
    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason;
      updateData.reviewedBy = req.user._id;
      updateData.reviewedAt = new Date();
    }

    const exchange = await ClinicalExchange.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('patient', 'firstName lastName mrn')
      .populate('fromProvider', 'name type')
      .populate('toProvider', 'name type')
      .populate('requestedBy', 'name role')
      .populate('reviewedBy', 'name role');

    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange not found' });
    }

    // Real-time notification
    const io = req.app.get('io');
    io.emit('exchange:status', { exchange });

    res.json({ success: true, data: exchange });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get exchange stats
// @route   GET /api/exchanges/stats
exports.getExchangeStats = async (req, res) => {
  try {
    const stats = await ClinicalExchange.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const byType = await ClinicalExchange.aggregate([
      {
        $group: {
          _id: '$documentType',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        byStatus: stats,
        byType,
        total: stats.reduce((acc, s) => acc + s.count, 0),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

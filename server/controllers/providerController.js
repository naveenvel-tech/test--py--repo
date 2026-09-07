const Provider = require('../models/Provider');

// @desc    Get all providers
// @route   GET /api/providers
exports.getProviders = async (req, res) => {
  try {
    const { type, search } = req.query;
    let query = { isActive: true };

    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialties: { $regex: search, $options: 'i' } },
      ];
    }

    const providers = await Provider.find(query).sort({ name: 1 });
    res.json({ success: true, count: providers.length, data: providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single provider
// @route   GET /api/providers/:id
exports.getProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    res.json({ success: true, data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create provider
// @route   POST /api/providers
exports.createProvider = async (req, res) => {
  try {
    const provider = await Provider.create(req.body);
    res.status(201).json({ success: true, data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update provider
// @route   PUT /api/providers/:id
exports.updateProvider = async (req, res) => {
  try {
    const provider = await Provider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    res.json({ success: true, data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete provider
// @route   DELETE /api/providers/:id
exports.deleteProvider = async (req, res) => {
  try {
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    res.json({ success: true, message: 'Provider deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

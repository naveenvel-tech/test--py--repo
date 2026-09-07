const Appointment = require('../models/Appointment');

// @desc    Get all appointments
// @route   GET /api/appointments
exports.getAppointments = async (req, res) => {
  try {
    const { status, doctor, date, type, page = 1, limit = 20 } = req.query;

    let query = {};

    if (status) query.status = status;
    if (doctor) query.doctor = doctor;
    if (type) query.type = type;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.dateTime = { $gte: start, $lte: end };
    }

    // If user is a doctor, show only their appointments
    if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName mrn contactInfo')
      .populate('doctor', 'name specialization')
      .populate('provider', 'name')
      .sort({ dateTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: appointments.length,
      total,
      pages: Math.ceil(total / limit),
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create appointment
// @route   POST /api/appointments
exports.createAppointment = async (req, res) => {
  try {
    req.body.createdBy = req.user._id;

    const appointment = await Appointment.create(req.body);

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName mrn')
      .populate('doctor', 'name specialization');

    // Real-time notification
    const io = req.app.get('io');
    io.emit('appointment:created', { appointment: populated });

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('patient', 'firstName lastName mrn')
      .populate('doctor', 'name specialization');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('patient', 'firstName lastName mrn')
      .populate('doctor', 'name specialization');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Real-time notification
    const io = req.app.get('io');
    io.emit('appointment:status', { appointment });

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get today's schedule
// @route   GET /api/appointments/today
exports.getTodaySchedule = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    let query = { dateTime: { $gte: start, $lte: end } };

    if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName mrn contactInfo')
      .populate('doctor', 'name specialization')
      .sort({ dateTime: 1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

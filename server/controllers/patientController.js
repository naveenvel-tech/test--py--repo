const Patient = require('../models/Patient');

// Generate unique MRN
const generateMRN = async () => {
  const count = await Patient.countDocuments();
  return `MRN-${String(count + 1001).padStart(6, '0')}`;
};

// @desc    Get all patients
// @route   GET /api/patients
exports.getPatients = async (req, res) => {
  try {
    const { search, gender, bloodGroup, page = 1, limit = 20 } = req.query;

    let query = { isActive: true };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { mrn: { $regex: search, $options: 'i' } },
        { 'contactInfo.phone': { $regex: search, $options: 'i' } },
      ];
    }

    if (gender) query.gender = gender;
    if (bloodGroup) query.bloodGroup = bloodGroup;

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .populate('assignedDoctor', 'name specialization')
      .populate('assignedProvider', 'name type')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: patients.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: patients,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('assignedDoctor', 'name specialization email')
      .populate('assignedProvider', 'name type phone')
      .populate('createdBy', 'name role');

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create patient
// @route   POST /api/patients
exports.createPatient = async (req, res) => {
  try {
    req.body.mrn = await generateMRN();
    req.body.createdBy = req.user._id;

    const patient = await Patient.create(req.body);

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('patient:created', { patient: { _id: patient._id, fullName: `${patient.firstName} ${patient.lastName}`, mrn: patient.mrn } });

    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete patient (soft delete)
// @route   DELETE /api/patients/:id
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, message: 'Patient record deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update patient vitals
// @route   PUT /api/patients/:id/vitals
exports.updateVitals = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        vitals: { ...req.body, lastUpdated: new Date() },
      },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get patient timeline
// @route   GET /api/patients/:id/timeline
exports.getTimeline = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Build timeline from medical history + appointments
    const Appointment = require('../models/Appointment');
    const ClinicalExchange = require('../models/ClinicalExchange');

    const appointments = await Appointment.find({ patient: req.params.id })
      .populate('doctor', 'name')
      .sort({ dateTime: -1 });

    const exchanges = await ClinicalExchange.find({ patient: req.params.id })
      .populate('fromProvider', 'name')
      .populate('toProvider', 'name')
      .sort({ createdAt: -1 });

    const timeline = [
      ...patient.medicalHistory.map((h) => ({
        type: 'medical_history',
        date: h.diagnosedDate,
        title: h.condition,
        details: h.notes,
        status: h.status,
      })),
      ...appointments.map((a) => ({
        type: 'appointment',
        date: a.dateTime,
        title: `${a.type} with Dr. ${a.doctor?.name || 'N/A'}`,
        details: a.reason,
        status: a.status,
      })),
      ...exchanges.map((e) => ({
        type: 'exchange',
        date: e.createdAt,
        title: `${e.documentType}: ${e.subject}`,
        details: `From ${e.fromProvider?.name} to ${e.toProvider?.name}`,
        status: e.status,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, data: timeline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

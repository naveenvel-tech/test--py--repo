const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const ClinicalExchange = require('../models/ClinicalExchange');
const Provider = require('../models/Provider');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    // Get date ranges
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);

    // Parallel queries for stats
    const [
      totalPatients,
      todayAppointments,
      pendingExchanges,
      activeProviders,
      totalUsers,
      appointmentsThisWeek,
      newPatientsThisWeek,
      exchangesByStatus,
      appointmentsByStatus,
    ] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Appointment.countDocuments({
        dateTime: { $gte: startOfDay, $lte: endOfDay },
      }),
      ClinicalExchange.countDocuments({ status: 'pending' }),
      Provider.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
      Appointment.countDocuments({
        dateTime: { $gte: startOfWeek, $lte: endOfDay },
      }),
      Patient.countDocuments({
        createdAt: { $gte: startOfWeek },
        isActive: true,
      }),
      ClinicalExchange.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        {
          $match: { dateTime: { $gte: startOfWeek, $lte: endOfDay } },
        },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    // Appointments per day for last 7 days
    const appointmentsByDay = await Appointment.aggregate([
      {
        $match: {
          dateTime: { $gte: startOfWeek, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$dateTime' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalPatients,
        todayAppointments,
        pendingExchanges,
        activeProviders,
        totalUsers,
        appointmentsThisWeek,
        newPatientsThisWeek,
        exchangesByStatus,
        appointmentsByStatus,
        appointmentsByDay,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
exports.getRecentActivity = async (req, res) => {
  try {
    const activities = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

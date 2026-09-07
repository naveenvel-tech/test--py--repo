const express = require('express');
const router = express.Router();
const {
  getAppointments,
  createAppointment,
  updateAppointment,
  updateStatus,
  getTodaySchedule,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

router.use(protect);

router
  .route('/')
  .get(auditLogger('READ', 'Appointment'), getAppointments)
  .post(
    authorize('admin', 'doctor', 'nurse', 'receptionist'),
    auditLogger('CREATE', 'Appointment'),
    createAppointment
  );

router.get('/today', auditLogger('READ', 'Appointment'), getTodaySchedule);

router
  .route('/:id')
  .put(
    authorize('admin', 'doctor', 'nurse', 'receptionist'),
    auditLogger('UPDATE', 'Appointment'),
    updateAppointment
  );

router.put(
  '/:id/status',
  authorize('admin', 'doctor', 'nurse', 'receptionist'),
  auditLogger('STATUS_CHANGE', 'Appointment'),
  updateStatus
);

module.exports = router;

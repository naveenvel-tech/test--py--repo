const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  updateVitals,
  getTimeline,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

router.use(protect);

router
  .route('/')
  .get(auditLogger('READ', 'Patient'), getPatients)
  .post(authorize('admin', 'doctor', 'nurse', 'receptionist'), auditLogger('CREATE', 'Patient'), createPatient);

router
  .route('/:id')
  .get(auditLogger('READ', 'Patient'), getPatient)
  .put(authorize('admin', 'doctor', 'nurse', 'receptionist'), auditLogger('UPDATE', 'Patient'), updatePatient)
  .delete(authorize('admin'), auditLogger('DELETE', 'Patient'), deletePatient);

router.put('/:id/vitals', authorize('admin', 'doctor', 'nurse'), auditLogger('UPDATE', 'Patient'), updateVitals);
router.get('/:id/timeline', auditLogger('READ', 'Patient'), getTimeline);

module.exports = router;

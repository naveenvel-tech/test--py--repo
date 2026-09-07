const express = require('express');
const router = express.Router();
const {
  getExchanges,
  createExchange,
  updateExchangeStatus,
  getExchangeStats,
} = require('../controllers/exchangeController');
const { protect, authorize } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

router.use(protect);

router
  .route('/')
  .get(auditLogger('READ', 'Exchange'), getExchanges)
  .post(
    authorize('admin', 'doctor', 'lab_technician'),
    auditLogger('EXCHANGE', 'ClinicalExchange'),
    createExchange
  );

router.get('/stats', auditLogger('READ', 'Exchange'), getExchangeStats);

router.put(
  '/:id/status',
  authorize('admin', 'doctor', 'lab_technician'),
  auditLogger('STATUS_CHANGE', 'ClinicalExchange'),
  updateExchangeStatus
);

module.exports = router;

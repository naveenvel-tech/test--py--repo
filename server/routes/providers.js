const express = require('express');
const router = express.Router();
const {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

router.use(protect);

router
  .route('/')
  .get(auditLogger('READ', 'Provider'), getProviders)
  .post(authorize('admin'), auditLogger('CREATE', 'Provider'), createProvider);

router
  .route('/:id')
  .get(auditLogger('READ', 'Provider'), getProvider)
  .put(authorize('admin'), auditLogger('UPDATE', 'Provider'), updateProvider)
  .delete(authorize('admin'), auditLogger('DELETE', 'Provider'), deleteProvider);

module.exports = router;

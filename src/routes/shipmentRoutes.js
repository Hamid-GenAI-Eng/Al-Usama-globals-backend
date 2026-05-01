const express = require('express');
const router = express.Router();
const {
  createShipment,
  getShipments,
  getShipmentById,
  updateShipmentStatus
} = require('../controllers/shipmentController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('MASTER_ADMIN', 'OPS_MANAGER', 'TRADE_AGENT'), createShipment)
  .get(protect, getShipments);

router.route('/:id')
  .get(protect, getShipmentById);

router.patch('/:id/status', protect, authorize('MASTER_ADMIN', 'OPS_MANAGER'), updateShipmentStatus);

module.exports = router;

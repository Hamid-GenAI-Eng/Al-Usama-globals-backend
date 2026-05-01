const express = require('express');
const router = express.Router();
const { getExchangeRates, updateExchangeRate } = require('../controllers/financeController');
const { protect, authorize } = require('../middleware/auth');

router.route('/rates')
  .get(protect, getExchangeRates)
  .post(protect, authorize('MASTER_ADMIN', 'OPS_MANAGER'), updateExchangeRate);

module.exports = router;

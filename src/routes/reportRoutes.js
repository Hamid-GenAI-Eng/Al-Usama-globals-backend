const express = require('express');
const router = express.Router();
const { getReportsSummary } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/summary', protect, authorize('MASTER_ADMIN', 'OPS_MANAGER'), getReportsSummary);

module.exports = router;

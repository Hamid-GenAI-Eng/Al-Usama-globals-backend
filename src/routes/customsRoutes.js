const express = require('express');
const router = express.Router();
const { lookupHSCode, calculateDuty } = require('../controllers/customsController');
const { protect } = require('../middleware/auth');

router.get('/hs-codes', protect, lookupHSCode);
router.post('/calculate-duty', protect, calculateDuty);

module.exports = router;

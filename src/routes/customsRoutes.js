const express = require('express');
const router = express.Router();
const { lookupHSCode, calculateDuty, fileGoodsDeclaration } = require('../controllers/customsController');
const { protect } = require('../middleware/auth');

router.get('/hs-codes', protect, lookupHSCode);
router.post('/calculate-duty', protect, calculateDuty);
router.post('/weboc', protect, fileGoodsDeclaration);

module.exports = router;

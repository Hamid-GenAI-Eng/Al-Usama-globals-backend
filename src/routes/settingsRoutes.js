const express = require('express');
const router = express.Router();
const { getAgencySettings, updateAgencySettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

router.route('/agency')
  .get(protect, getAgencySettings)
  .patch(protect, authorize('MASTER_ADMIN'), updateAgencySettings);

module.exports = router;

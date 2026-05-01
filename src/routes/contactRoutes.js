const express = require('express');
const router = express.Router();
const { createContact, getContacts } = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createContact)
  .get(protect, getContacts);

module.exports = router;

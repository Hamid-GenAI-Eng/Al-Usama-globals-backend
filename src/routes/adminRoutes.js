const express = require('express');
const router = express.Router();
const { getUsers, updateUser } = require('../controllers/adminController');
const { getAuditLogs } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');

// Audit logs
router.get('/audit-log', protect, authorize('MASTER_ADMIN'), getAuditLogs);

// User management
router.get('/users', protect, authorize('MASTER_ADMIN'), getUsers);
router.patch('/users/:id', protect, authorize('MASTER_ADMIN'), updateUser);

module.exports = router;

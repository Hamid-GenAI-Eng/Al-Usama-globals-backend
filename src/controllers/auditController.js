const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Get all audit logs
 * @route   GET /api/admin/audit-log
 * @access  Private (Admin only)
 */
const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: { select: { fullName: true, role: true } }
      },
      orderBy: { timestamp: 'desc' },
      take: 100 // Limit to last 100 for performance
    });

    return successResponse(res, logs, 'Audit logs retrieved');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error retrieving audit logs');
  }
};

module.exports = { getAuditLogs };

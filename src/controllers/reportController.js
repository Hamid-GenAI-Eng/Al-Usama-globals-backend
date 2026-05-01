const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Get system reports summary
 * @route   GET /api/reports/summary
 * @access  Private (Admin/Manager)
 */
const getReportsSummary = async (req, res) => {
  try {
    const reportStats = [
      { id: 1, name: 'Profit & Loss Statement', lastGenerated: '2 days ago', type: 'Financial', size: '1.2 MB' },
      { id: 2, name: 'Shipment Volume Analysis', lastGenerated: 'Yesterday', type: 'Operations', size: '850 KB' },
      { id: 3, name: 'Tax Summary (FBR)', lastGenerated: '1 week ago', type: 'Compliance', size: '2.4 MB' },
      { id: 4, name: 'Supplier Performance', lastGenerated: '3 days ago', type: 'CRM', size: '420 KB' },
    ];

    return successResponse(res, reportStats, 'Reports summary retrieved');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error retrieving reports');
  }
};

module.exports = { getReportsSummary };

const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Get dashboard analytics summary
 * @route   GET /api/analytics/summary
 * @access  Private
 */
const getDashboardSummary = async (req, res) => {
  try {
    const totalShipments = await prisma.shipment.count();
    const activeShipments = await prisma.shipment.count({
      where: { status: { notIn: ['DELIVERED'] } }
    });
    
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      where: { type: 'SALES' },
      _sum: { totalAmount: true }
    });

    const recentShipments = await prisma.shipment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true } } }
    });

    return successResponse(res, {
      stats: {
        totalShipments,
        activeShipments,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0
      },
      recentShipments
    }, 'Analytics summary retrieved');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error retrieving analytics');
  }
};

module.exports = { getDashboardSummary };

const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Get dashboard analytics summary
 * @route   GET /api/analytics/summary
 * @access  Private
 */
const getDashboardSummary = async (req, res) => {
  try {
    // 1. Core KPIs
    const totalShipments = await prisma.shipment.count();
    const activeShipments = await prisma.shipment.count({
      where: { status: { notIn: ['DELIVERED'] } }
    });
    
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      where: { type: 'SALES' },
      _sum: { totalAmount: true }
    });

    const revenueAmount = totalRevenue._sum.totalAmount || 0;

    // 2. Recent Shipments
    const recentShipments = await prisma.shipment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true } } }
    });

    // 3. Recent Activity (Mapped from Audit Logs)
    const recentActivityLogs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { fullName: true } } }
    });

    const recentActivity = recentActivityLogs.map(log => {
      const timeString = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        who: log.user?.fullName || 'System',
        what: log.action,
        target: log.target || log.module,
        time: timeString
      };
    });

    // 4. Shipment Volume (imports vs exports trend)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const volumeData = [];
    
    const allShipmentsForStats = await prisma.shipment.findMany({
      select: {
        createdAt: true,
        origin: true,
        destination: true
      }
    });

    const monthlyCounts = {};
    
    // Seed last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = monthNames[d.getMonth()];
      const year = d.getFullYear();
      const key = `${mName} ${year}`;
      monthlyCounts[key] = { month: mName, imports: 0, exports: 0, importsCount: 0, exportsCount: 0 };
    }

    allShipmentsForStats.forEach(shp => {
      const date = new Date(shp.createdAt);
      const mName = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const key = `${mName} ${year}`;
      
      if (monthlyCounts[key]) {
        const destLower = shp.destination.toLowerCase();
        const isImport = destLower.includes('pakistan') || 
                         destLower.includes('karachi') || 
                         destLower.includes('pk') ||
                         destLower.includes('port qasim');
        if (isImport) {
          monthlyCounts[key].imports += 1;
          monthlyCounts[key].importsCount += 1;
        } else {
          monthlyCounts[key].exports += 1;
          monthlyCounts[key].exportsCount += 1;
        }
      }
    });

    Object.keys(monthlyCounts).forEach(k => {
      volumeData.push(monthlyCounts[k]);
    });

    // 5. Top Trade Routes
    const routeGroups = await prisma.shipment.groupBy({
      by: ['origin', 'destination'],
      _count: { id: true }
    });

    const topTradeRoutes = routeGroups.map(g => ({
      route: `${g.origin} → ${g.destination}`,
      volume: g._count.id,
      value: `$${(g._count.id * 145000 / 1000).toFixed(0)}K`
    })).sort((a, b) => b.volume - a.volume).slice(0, 4);

    // 6. Dynamic Pending Tasks
    const pendingShipments = await prisma.shipment.findMany({
      where: { status: 'PENDING' },
      take: 2,
      orderBy: { createdAt: 'desc' }
    });

    const draftOrders = await prisma.order.findMany({
      where: { status: 'DRAFT' },
      take: 2,
      orderBy: { createdAt: 'desc' }
    });

    const tasks = [];

    pendingShipments.forEach(s => {
      tasks.push({
        label: `Upload Bill of Lading for ${s.shipmentId}`,
        due: "Today",
        priority: "high"
      });
    });

    draftOrders.forEach(o => {
      tasks.push({
        label: `Review PO-${o.orderNumber} line items`,
        due: "Tomorrow",
        priority: "med"
      });
    });

    // 7. Dynamic Product Categories from Order Items
    const orderItems = await prisma.orderItem.findMany({
      select: { description: true }
    });

    const categoryMap = {
      "Electronics": { count: 0, color: "hsl(217, 91%, 60%)" },
      "Textiles": { count: 0, color: "hsl(173, 80%, 40%)" },
      "Machinery": { count: 0, color: "hsl(43, 96%, 56%)" },
      "Steel": { count: 0, color: "hsl(280, 70%, 60%)" },
      "Food": { count: 0, color: "hsl(160, 84%, 39%)" }
    };

    if (orderItems.length > 0) {
      orderItems.forEach(item => {
        const desc = (item.description || "").toLowerCase();
        if (desc.includes('laptop') || desc.includes('phone') || desc.includes('electron') || desc.includes('data')) {
          categoryMap["Electronics"].count += 1;
        } else if (desc.includes('fabric') || desc.includes('textile') || desc.includes('cloth') || desc.includes('garment')) {
          categoryMap["Textiles"].count += 1;
        } else if (desc.includes('machine') || desc.includes('tool') || desc.includes('equip')) {
          categoryMap["Machinery"].count += 1;
        } else if (desc.includes('steel') || desc.includes('iron') || desc.includes('metal')) {
          categoryMap["Steel"].count += 1;
        } else {
          categoryMap["Food"].count += 1;
        }
      });
    }

    const totalCategoriesCount = Object.values(categoryMap).reduce((sum, c) => sum + c.count, 0);

    const productCategories = totalCategoriesCount > 0 
      ? Object.keys(categoryMap).map(name => ({
          name,
          value: Math.round((categoryMap[name].count / totalCategoriesCount) * 100),
          color: categoryMap[name].color
        }))
      : [];

    return successResponse(res, {
      stats: {
        totalShipments,
        activeShipments,
        totalOrders,
        totalRevenue: revenueAmount
      },
      recentShipments,
      recentActivity,
      shipmentVolume: volumeData,
      topTradeRoutes,
      tasks,
      productCategories,
      reportsCount: 14
    }, 'Analytics summary retrieved');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error retrieving analytics');
  }
};

module.exports = { getDashboardSummary };

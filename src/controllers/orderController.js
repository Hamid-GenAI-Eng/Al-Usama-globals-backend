const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Create a new order (Purchase/Sales)
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res) => {
  const { orderNumber, type, contactId, items, currency, status } = req.body;

  try {
    const existing = await prisma.order.findUnique({ where: { orderNumber } });
    if (existing) return errorResponse(res, 'Order number already exists', 400);

    // Calculate total amount
    const totalAmount = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        type,
        contactId: parseInt(contactId),
        currency: currency || 'PKR',
        status: status || 'DRAFT',
        totalAmount,
        items: {
          create: items.map(item => ({
            description: item.description,
            hsCode: item.hsCode,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseInt(item.quantity) * parseFloat(item.unitPrice)
          }))
        }
      },
      include: { items: true, contact: true }
    });

    return successResponse(res, order, 'Order created successfully', 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error creating order');
  }
};

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private
 */
const getOrders = async (req, res) => {
  const { type, status } = req.query;

  try {
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        contact: { select: { name: true, type: true } },
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, orders, 'Orders retrieved');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error retrieving orders');
  }
};

module.exports = {
  createOrder,
  getOrders
};

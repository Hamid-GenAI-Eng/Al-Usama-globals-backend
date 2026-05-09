const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Create a new shipment
 * @route   POST /api/shipments
 * @access  Private (Agent/Manager/Admin)
 */
const createShipment = async (req, res) => {
  const { shipmentId, origin, destination, vesselName, departureDate, arrivalDate } = req.body;

  try {
    const existing = await prisma.shipment.findUnique({ where: { shipmentId } });
    if (existing) return errorResponse(res, 'Shipment ID already exists', 400);

    const shipment = await prisma.shipment.create({
      data: {
        shipmentId,
        origin,
        destination,
        vesselName,
        departureDate: departureDate ? new Date(departureDate) : null,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
        userId: req.user.id
      }
    });

    // Create initial status log
    await prisma.shipmentStatusLog.create({
      data: {
        shipmentId: shipment.id,
        status: 'PENDING',
        description: 'Shipment created in architectural ledger'
      }
    });

    return successResponse(res, shipment, 'Shipment created successfully', 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error creating shipment');
  }
};

/**
 * @desc    Get all shipments (Filterable)
 * @route   GET /api/shipments
 * @access  Private
 */
const getShipments = async (req, res) => {
  try {
    const { status, origin, destination } = req.query;

    const where = {};
    if (status) where.status = status;
    if (origin) where.origin = { contains: origin };
    if (destination) where.destination = { contains: destination };

    // If client, only show their shipments (assuming users are linked to shipments)
    if (req.user.role === 'CLIENT') {
      where.userId = req.user.id;
    }

    const shipments = await prisma.shipment.findMany({
      where,
      include: {
        user: { select: { fullName: true, email: true } },
        _count: { select: { documents: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, shipments, 'Shipments retrieved');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error retrieving shipments');
  }
};

/**
 * @desc    Get single shipment details
 * @route   GET /api/shipments/:id
 * @access  Private
 */
const getShipmentById = async (req, res) => {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { fullName: true, email: true } },
        documents: true,
        statusLogs: { orderBy: { timestamp: 'desc' } }
      }
    });

    if (!shipment) return errorResponse(res, 'Shipment not found', 404);

    // Access control
    if (req.user.role === 'CLIENT' && shipment.userId !== req.user.id) {
      return errorResponse(res, 'Not authorized to view this shipment', 403);
    }

    return successResponse(res, shipment, 'Shipment details retrieved');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error retrieving shipment');
  }
};

/**
 * @desc    Update shipment status
 * @route   PATCH /api/shipments/:id/status
 * @access  Private (Ops Manager/Admin)
 */
const updateShipmentStatus = async (req, res) => {
  const { status, description } = req.body;

  try {
    const shipment = await prisma.shipment.update({
      where: { id: req.params.id },
      data: { status }
    });

    await prisma.shipmentStatusLog.create({
      data: {
        shipmentId: shipment.id,
        status,
        description
      }
    });

    return successResponse(res, shipment, `Shipment status updated to ${status}`);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error updating status');
  }
};

module.exports = {
  createShipment,
  getShipments,
  getShipmentById,
  updateShipmentStatus
};

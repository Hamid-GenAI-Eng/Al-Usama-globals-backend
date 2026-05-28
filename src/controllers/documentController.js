const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary');
const { successResponse, errorResponse } = require('../utils/response');
const fs = require('fs');

/**
 * @desc    Upload a document
 * @route   POST /api/documents/upload
 * @access  Private
 */
const uploadDocument = async (req, res) => {
  const { name, type, shipmentId } = req.body;

  if (!req.file) {
    return errorResponse(res, 'Please upload a file', 400);
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'al-usama/documents',
      resource_type: 'auto'
    });

    // Delete local temp file
    fs.unlinkSync(req.file.path);

    const document = await prisma.document.create({
      data: {
        name: name || req.file.originalname,
        type: type || 'Other',
        fileUrl: result.secure_url,
        cloudinaryId: result.public_id,
        shipmentId: shipmentId || null,
        userId: req.user.id
      }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'uploaded Document',
        target: document.name,
        module: 'Documents',
        ipAddress: req.ip || '0.0.0.0'
      }
    });

    return successResponse(res, document, 'Document uploaded and secured in vault', 201);
  } catch (error) {
    console.error(error);
    // Try to delete local file if it still exists
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return errorResponse(res, 'Error uploading document');
  }
};

/**
 * @desc    Get all documents
 * @route   GET /api/documents
 * @access  Private
 */
const getDocuments = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'CLIENT') {
      where.userId = req.user.id;
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        shipment: { select: { shipmentId: true } },
        user: { select: { fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, documents, 'Documents retrieved');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error retrieving documents');
  }
};

module.exports = {
  uploadDocument,
  getDocuments
};

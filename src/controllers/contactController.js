const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Create a new contact (Supplier/Buyer)
 * @route   POST /api/contacts
 * @access  Private
 */
const createContact = async (req, res) => {
  const { name, type, email, phone, address, country, notes } = req.body;

  try {
    const contact = await prisma.contact.create({
      data: { name, type, email, phone, address, country, notes }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: `added CRM Contact ${name}`,
        target: type,
        module: 'CRM',
        ipAddress: req.ip || '0.0.0.0'
      }
    });

    return successResponse(res, contact, 'Contact added to CRM', 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error creating contact');
  }
};

/**
 * @desc    Get all contacts
 * @route   GET /api/contacts
 * @access  Private
 */
const getContacts = async (req, res) => {
  const { type } = req.query;

  try {
    const where = {};
    if (type) where.type = type;

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    return successResponse(res, contacts, 'Contacts retrieved');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error retrieving contacts');
  }
};

module.exports = {
  createContact,
  getContacts
};

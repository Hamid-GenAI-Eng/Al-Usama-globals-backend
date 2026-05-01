const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Get agency settings
 * @route   GET /api/settings/agency
 * @access  Private
 */
const getAgencySettings = async (req, res) => {
  try {
    let settings = await prisma.agencySettings.findFirst();
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.agencySettings.create({ data: {} });
    }
    return successResponse(res, settings, 'Agency settings retrieved');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error retrieving agency settings');
  }
};

/**
 * @desc    Update agency settings
 * @route   PATCH /api/settings/agency
 * @access  Private (Admin only)
 */
const updateAgencySettings = async (req, res) => {
  const { name, legalName, ntn, strn, address, phone, email } = req.body;

  try {
    const existing = await prisma.agencySettings.findFirst();
    let settings;
    
    if (existing) {
      settings = await prisma.agencySettings.update({
        where: { id: existing.id },
        data: { name, legalName, ntn, strn, address, phone, email }
      });
    } else {
      settings = await prisma.agencySettings.create({
        data: { name, legalName, ntn, strn, address, phone, email }
      });
    }
    
    return successResponse(res, settings, 'Agency settings updated');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error updating agency settings');
  }
};

module.exports = {
  getAgencySettings,
  updateAgencySettings
};

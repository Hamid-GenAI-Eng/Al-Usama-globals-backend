const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Get all exchange rates
 * @route   GET /api/finance/rates
 * @access  Private
 */
const getExchangeRates = async (req, res) => {
  try {
    const rates = await prisma.exchangeRate.findMany({
      orderBy: { currencyCode: 'asc' }
    });
    return successResponse(res, rates, 'Exchange rates retrieved');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error retrieving rates');
  }
};

/**
 * @desc    Update or create an exchange rate
 * @route   POST /api/finance/rates
 * @access  Private (Admin only)
 */
const updateExchangeRate = async (req, res) => {
  const { currencyCode, rateToPkr, source } = req.body;

  try {
    const rate = await prisma.exchangeRate.upsert({
      where: { currencyCode },
      update: { rateToPkr: parseFloat(rateToPkr), source: source || 'Manual' },
      create: { currencyCode, rateToPkr: parseFloat(rateToPkr), source: source || 'Manual' }
    });
    return successResponse(res, rate, `Rate for ${currencyCode} updated`);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error updating rate');
  }
};

module.exports = {
  getExchangeRates,
  updateExchangeRate
};

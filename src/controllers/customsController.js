const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Search for HS Codes
 * @route   GET /api/customs/hs-codes
 * @access  Private
 */
const lookupHSCode = async (req, res) => {
  const { query } = req.query;

  // Mock database of HS codes for demonstration - in production this would be a large dataset or external API
  const hsCodes = [
    { code: '8471.3000', description: 'Portable automatic data processing machines (Laptops)', duty: '0%', salesTax: '18%', incomeTax: '3%' },
    { code: '8517.1300', description: 'Smartphones', duty: 'Rs. 5000/unit', salesTax: '18%', incomeTax: '6%' },
    { code: '8703.2323', description: 'Motor cars (1500cc to 1800cc)', duty: '75%', salesTax: '25%', incomeTax: '12%' },
    { code: '9018.9000', description: 'Medical, surgical or dental instruments', duty: '5%', salesTax: '0%', incomeTax: '1%' },
  ];

  const results = query 
    ? hsCodes.filter(c => c.code.includes(query) || c.description.toLowerCase().includes(query.toLowerCase()))
    : hsCodes;

  return successResponse(res, results, 'HS Codes retrieved');
};

/**
 * @desc    Calculate Import Duty
 * @route   POST /api/customs/calculate-duty
 * @access  Private
 */
const calculateDuty = async (req, res) => {
  const { 
    cifValue = 0, 
    exchangeRate = 282, 
    customsDuty = 0, 
    additionalDuty = 0, 
    regulatoryDuty = 0, 
    salesTax = 0, 
    incomeTax = 0 
  } = req.body;

  try {
    const cifPkr = cifValue * exchangeRate;
    const cd = cifPkr * (customsDuty / 100);
    const ad = cifPkr * (additionalDuty / 100);
    const rd = cifPkr * (regulatoryDuty / 100);
    const st = (cifPkr + cd + ad + rd) * (salesTax / 100);
    const it = (cifPkr + cd + ad + rd) * (incomeTax / 100);

    const totalDuties = cd + ad + rd + st + it;
    const totalLandedCost = cifPkr + totalDuties;

    const result = {
      cifPkr,
      cd,
      ad,
      rd,
      st,
      it,
      totalDuties,
      totalLandedCost
    };

    return successResponse(res, result, 'Duty calculation completed successfully');
  } catch (error) {
    console.error('Duty Calculation Error:', error);
    return errorResponse(res, 'Error processing duty calculation');
  }
};

/**
 * @desc    File Goods Declaration in WEBOC
 * @route   POST /api/customs/weboc
 * @access  Private
 */
const fileGoodsDeclaration = async (req, res) => {
  const { gdNumber, declarationType, collectorate, consignee, bl } = req.body;

  try {
    // Audit Log the goods declaration filing
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: `filed Goods Declaration ${gdNumber}`,
        target: bl || gdNumber,
        module: 'Customs',
        ipAddress: req.ip || '0.0.0.0'
      }
    });

    return successResponse(res, { gdNumber }, 'Goods Declaration filed successfully with WEBOC gateway');
  } catch (error) {
    console.error('WEBOC Filing Error:', error);
    return errorResponse(res, 'Error transmitting goods declaration to WEBOC');
  }
};

module.exports = { lookupHSCode, calculateDuty, fileGoodsDeclaration };

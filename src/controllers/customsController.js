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
  const { value, hsCode, currency } = req.body;

  // Simple calculation logic
  const dutyRate = 0.15; // 15% flat for demo
  const salesTaxRate = 0.18; // 18% GST
  
  const dutyAmount = value * dutyRate;
  const salesTaxAmount = (value + dutyAmount) * salesTaxRate;
  const totalTaxes = dutyAmount + salesTaxAmount;

  const result = {
    assessedValue: value,
    currency: currency || 'USD',
    breakdown: [
      { name: 'Customs Duty (15%)', amount: dutyAmount },
      { name: 'Sales Tax (18%)', amount: salesTaxAmount },
      { name: 'Additional Customs Duty', amount: value * 0.02 },
      { name: 'Income Tax (Advance)', amount: value * 0.05 },
    ],
    totalPayable: totalTaxes + (value * 0.07)
  };

  return successResponse(res, result, 'Duty calculation completed');
};

module.exports = { lookupHSCode, calculateDuty };

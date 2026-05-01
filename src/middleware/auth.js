const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { errorResponse } = require('../utils/response');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true
        }
      });

      if (!req.user || !req.user.isActive) {
        return errorResponse(res, 'Not authorized, user not found or inactive', 401);
      }

      next();
    } catch (error) {
      console.error(error);
      return errorResponse(res, 'Not authorized, token failed', 401);
    }
  }

  if (!token) {
    return errorResponse(res, 'Not authorized, no token', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, `User role ${req.user.role} is not authorized to access this route`, 403);
    }
    next();
  };
};

module.exports = { protect, authorize };

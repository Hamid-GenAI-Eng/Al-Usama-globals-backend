const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  const { email, password, fullName, role } = req.body;

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      return errorResponse(res, 'User already exists', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: role || 'TRADE_AGENT'
      },
    });

    if (user) {
      return successResponse(res, {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      }, 'User registered successfully', 201);
    }
  } catch (error) {
    console.error(error);
    return errorResponse(res, `Server error: ${error.message}`);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      return successResponse(res, {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      }, 'Login successful');
    } else {
      return errorResponse(res, 'Invalid email or password', 401);
    }
  } catch (error) {
    console.error(error);
    return errorResponse(res, `Server error: ${error.message}`);
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  return successResponse(res, req.user, 'User profile retrieved');
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};

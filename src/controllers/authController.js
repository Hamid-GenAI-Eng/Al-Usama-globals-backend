const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const sendEmail = require('../utils/sendEmail');

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
  const { email, password, fullName, role, businessName } = req.body;
  console.log(`AUTH: Attempting registration for ${email}`);

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      console.log(`AUTH: Registration failed - user already exists: ${email}`);
      return errorResponse(res, 'User already exists', 400);
    }

    console.log(`AUTH: Hashing password for ${email}`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log(`AUTH: Creating user record for ${email}`);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: role || 'TRADE_AGENT'
      },
    });

    // If this is a MASTER_ADMIN, update the global Agency settings with the business name
    if (user && user.role === 'MASTER_ADMIN' && businessName) {
      console.log(`AUTH: Updating agency settings with business name: ${businessName}`);
      const existingSettings = await prisma.agencySettings.findFirst();
      if (existingSettings) {
        await prisma.agencySettings.update({
          where: { id: existingSettings.id },
          data: { name: businessName, email: email }
        });
      } else {
        await prisma.agencySettings.create({
          data: { name: businessName, email: email }
        });
      }
    }

    if (user) {
      console.log(`AUTH: User registered successfully: ${email}`);
      return successResponse(res, {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      }, 'User registered successfully', 201);
    }
  } catch (error) {
    console.error('AUTH: Crash during registration process:');
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
  console.log(`AUTH: Attempting login for ${email}`);

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log(`AUTH: User not found: ${email}`);
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      console.log(`AUTH: Login successful for ${email}`);
      return successResponse(res, {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      }, 'Login successful');
    } else {
      console.log(`AUTH: Password mismatch for ${email}`);
      return errorResponse(res, 'Invalid email or password', 401);
    }
  } catch (error) {
    console.error('AUTH: Crash during login process:');
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

/**
 * @desc    Update user profile
 * @route   PATCH /api/auth/me
 * @access  Private
 */
const updateMe = async (req, res) => {
  const { fullName } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { fullName },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true
      }
    });

    return successResponse(res, updatedUser, 'Profile updated successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error updating profile');
  }
};

/**
 * @desc    Request password reset link
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(`AUTH: Password reset requested for ${email}`);

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log(`AUTH: Password reset failed - user not found: ${email}`);
      return errorResponse(res, 'No account registered with this email address', 404);
    }

    // Generate a temporary 1-hour secure reset token containing email
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Build the reset URL
    const origin = req.headers.origin || 'http://localhost:5173';
    const resetUrl = `${origin}/reset-password?token=${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of the password for your Al-Usama account.\n\nPlease click on the following link, or paste this into your browser to complete the process within 1 hour:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; text-align: center;">Reset Your Al-Usama Password</h2>
        <p style="color: #334155; font-size: 16px; line-height: 1.5;">You are receiving this email because you (or someone else) have requested to reset the password for your Al-Usama account.</p>
        <p style="color: #334155; font-size: 16px; line-height: 1.5;">Please click the button below to secure your account and set a new password. This link is valid for <strong>1 hour</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px; line-height: 1.5;">If the button above doesn't work, copy and paste this URL into your browser:</p>
        <p style="color: #2563eb; font-size: 14px; word-break: break-all; margin-bottom: 30px;">${resetUrl}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">If you did not request a password reset, please ignore this email. Your password will remain completely secure.</p>
      </div>
    `;

    const emailResult = await sendEmail({
      email: user.email,
      subject: 'Al-Usama Security Check: Password Reset Request',
      message,
      html,
      resetUrl,
    });

    console.log(`AUTH: Password reset token created successfully for ${email}`);
    
    // Return success response, and include resetUrl if mocked (in dev mode) for easy access
    const responseData = {
      emailSent: emailResult.sent,
    };
    if (!emailResult.sent) {
      responseData.resetUrl = resetUrl; // Extremely helpful for local testing
    }

    return successResponse(res, responseData, 'A secure recovery link has been generated and sent.');
  } catch (error) {
    console.error('AUTH: Crash during forgot password process:');
    console.error(error);
    return errorResponse(res, `Server error: ${error.message}`);
  }
};

/**
 * @desc    Reset password using token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  console.log(`AUTH: Attempting password reset using token`);

  if (!token || !password) {
    return errorResponse(res, 'Token and new password are required', 400);
  }

  try {
    // Verify the JWT password-reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.log('AUTH: Token verification failed:', err.message);
      return errorResponse(res, 'The recovery link is invalid or has expired', 400);
    }

    // Check if the purpose of the token is password-reset
    if (decoded.purpose !== 'password-reset') {
      console.log('AUTH: Token purpose is invalid:', decoded.purpose);
      return errorResponse(res, 'The recovery link is invalid', 400);
    }

    // Find the user by Email
    const user = await prisma.user.findUnique({ where: { email: decoded.email } });

    if (!user) {
      console.log(`AUTH: Reset failed - user not found from token email: ${decoded.email}`);
      return errorResponse(res, 'User not found', 404);
    }

    // Hash the new password
    console.log(`AUTH: Hashing new password for user ${user.email}`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the password in database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    console.log(`AUTH: Password updated successfully for user ${user.email}`);
    return successResponse(res, null, 'Your password has been reset successfully. You can now login.');
  } catch (error) {
    console.error('AUTH: Crash during reset password process:');
    console.error(error);
    return errorResponse(res, `Server error: ${error.message}`);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  forgotPassword,
  resetPassword
};

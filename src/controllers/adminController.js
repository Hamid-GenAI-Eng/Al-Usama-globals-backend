const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Get all users (RBAC)
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { shipments: true, documents: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, users, 'User list retrieved');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error retrieving users');
  }
};

/**
 * @desc    Update user role or status
 * @route   PATCH /api/admin/users/:id
 * @access  Private (Admin only)
 */
const updateUser = async (req, res) => {
  const { role, isActive } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role, isActive }
    });

    return successResponse(res, user, 'User updated successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error updating user');
  }
};

module.exports = { getUsers, updateUser };

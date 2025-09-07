import { User } from '../models/user.model.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    // Find all users, excluding their password field for security
    const users = await User.find({}).select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Toggle a user's ban status
// @route   PATCH /api/admin/users/:userId/toggle-ban
// @access  Private/Admin
export const toggleUserBanStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Toggle the ban status
    user.isBanned = !user.isBanned;
    await user.save();

    // Return a clear message and the updated user object
    res.status(200).json({
      success: true,
      message: `User has been successfully ${user.isBanned ? 'banned' : 'unbanned'}.`,
      data: user,
    });
  } catch (error) {
    console.error('Error in toggleUserBanStatus:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

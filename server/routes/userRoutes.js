const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    updateUserPassword,
    getUsers,
    deleteUser,
    assignUserType,
    promoteToAdmin,
    demoteToUser,
    approveUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Profile routes
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.put('/password', protect, updateUserPassword);

// Get all users  – admin + super_admin
router.route('/')
    .get(protect, authorize('admin', 'super_admin'), getUsers);

// Delete a user – admin + super_admin (super_admin deletion blocked in controller)
router.route('/:id')
    .delete(protect, authorize('admin', 'super_admin'), deleteUser);

// Assign userType (student|teacher|guard|null) – admin + super_admin
router.patch('/:id/usertype', protect, authorize('admin', 'super_admin'), assignUserType);

// Promote to admin – super_admin ONLY
router.patch('/:id/promote-admin', protect, authorize('super_admin'), promoteToAdmin);

// Demote admin back to user – super_admin ONLY
router.patch('/:id/demote', protect, authorize('super_admin'), demoteToUser);

// Approve user – admin + super_admin
router.patch('/:id/approve', protect, authorize('admin', 'super_admin'), approveUser);

module.exports = router;

const User = require('../models/User');

// @desc    Get user profile (current logged-in user)
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile (name, email)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                userType: updatedUser.userType
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user password
// @route   PUT /api/users/password
// @access  Private
const updateUserPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(oldPassword))) {
            // Validate new password complexity
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                return res.status(400).json({ 
                    message: 'Password must be at least 8 characters long and include a letter, number, and special character.' 
                });
            }

            user.password = newPassword;
            await user.save(); // pre-save hook handles hashing

            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Incorrect old password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin & Super_Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').populate('roleChangedBy', 'name email');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin & Super_Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting a super_admin account via API
        if (user.role === 'super_admin') {
            return res.status(403).json({ message: 'Cannot delete a super_admin account via the API' });
        }

        await user.deleteOne();
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign userType to a user (student | teacher | guard | null)
// @route   PATCH /api/users/:id/usertype
// @access  Private/Admin & Super_Admin
const assignUserType = async (req, res) => {
    try {
        const { userType } = req.body;
        const allowedTypes = ['student', 'teacher', 'guard', null];

        // Accept the string "null" from the frontend as well
        const resolvedType = userType === 'null' ? null : userType;

        if (!allowedTypes.includes(resolvedType)) {
            return res.status(400).json({ message: `Invalid userType. Allowed: student, teacher, guard, or null` });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role !== 'user') {
            return res.status(400).json({ message: 'userType can only be assigned to users with role: user' });
        }

        // Use updateOne to bypass Mongoose string-cast issue with null
        await User.updateOne(
            { _id: user._id },
            { $set: { userType: resolvedType, roleChangedBy: req.user._id, roleChangedAt: new Date() } }
        );

        const updated = await User.findById(req.params.id).select('-password');
        res.json({
            message: `userType updated to '${resolvedType}'`,
            user: updated
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Promote a user to admin (role: user → admin)
// @route   PATCH /api/users/:id/promote-admin
// @access  Private/Super_Admin only
const promoteToAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role === 'super_admin') {
            return res.status(403).json({ message: 'Cannot modify a super_admin account' });
        }
        if (user.role === 'admin') {
            return res.status(400).json({ message: 'User is already an admin' });
        }

        await User.updateOne(
            { _id: user._id },
            { $set: { role: 'admin', userType: null, roleChangedBy: req.user._id, roleChangedAt: new Date() } }
        );

        const updated = await User.findById(user._id).select('-password');
        res.json({ message: `User '${user.name}' has been promoted to admin`, user: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Demote an admin back to user
// @route   PATCH /api/users/:id/demote
// @access  Private/Super_Admin only
const demoteToUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role === 'super_admin') {
            return res.status(403).json({ message: 'Cannot demote a super_admin account' });
        }
        if (user.role !== 'admin') {
            return res.status(400).json({ message: 'User is not an admin' });
        }

        await User.updateOne(
            { _id: user._id },
            { $set: { role: 'user', userType: null, roleChangedBy: req.user._id, roleChangedAt: new Date() } }
        );

        const updated = await User.findById(user._id).select('-password');
        res.json({ message: `User '${user.name}' has been demoted to user`, user: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve a pending user registration
// @route   PATCH /api/users/:id/approve
// @access  Private/Admin & Super_Admin
const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.isApproved) {
            return res.status(400).json({ message: 'User is already approved' });
        }

        await User.updateOne(
            { _id: user._id },
            { $set: { isApproved: true, roleChangedBy: req.user._id, roleChangedAt: new Date() } }
        );

        const updated = await User.findById(user._id).select('-password');
        res.json({ message: `User '${user.name}' has been approved and can now login`, user: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    updateUserPassword,
    getUsers,
    deleteUser,
    assignUserType,
    promoteToAdmin,
    demoteToUser,
    approveUser
};

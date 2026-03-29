const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Verify JWT cookie and attach user to request ─────────────────────────────
const protect = async (req, res, next) => {
    let token;

    token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// ── Check that the caller's role is in the allowed list ──────────────────────
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

// ── Check that the caller's userType is in the allowed list ──────────────────
// Used for endpoints that guard-type users (role:user, userType:guard) need.
const authorizeUserType = (...types) => {
    return (req, res, next) => {
        if (!types.includes(req.user.userType)) {
            return res.status(403).json({
                message: `User type '${req.user.userType}' is not authorized to access this route`
            });
        }
        next();
    };
};

// ── Combined: allow if role matches OR userType matches ───────────────────────
// e.g., allowRolesOrUserTypes(['admin','super_admin'], ['guard'])
const allowRolesOrUserTypes = (roles = [], userTypes = []) => {
    return (req, res, next) => {
        const roleOk = roles.includes(req.user.role);
        const typeOk = userTypes.includes(req.user.userType);
        if (roleOk || typeOk) return next();
        return res.status(403).json({
            message: 'Not authorized to access this route'
        });
    };
};

// ── Block role escalation attempts ────────────────────────────────────────────
// Rejects any request that tries to set role to 'admin' or 'super_admin'
// unless the caller is already a super_admin.
const blockRoleEscalation = (req, res, next) => {
    const attemptedRole = req.body?.role;
    const protectedRoles = ['admin', 'super_admin'];

    if (attemptedRole && protectedRoles.includes(attemptedRole)) {
        if (!req.user || req.user.role !== 'super_admin') {
            return res.status(403).json({
                message: 'Role escalation not permitted. Only super_admin can assign elevated roles.'
            });
        }
    }
    next();
};

module.exports = { protect, authorize, authorizeUserType, allowRolesOrUserTypes, blockRoleEscalation };

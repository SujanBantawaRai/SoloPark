const express = require('express');
const router = express.Router();
const { logEntry, logExit, getLogs } = require('../controllers/entryExitController');
const { protect, authorize, allowRolesOrUserTypes } = require('../middleware/authMiddleware');

// GET logs: allow admin/super_admin OR guard-typed users
router.route('/')
    .get(protect, allowRolesOrUserTypes(['admin', 'super_admin'], ['guard']), getLogs);

// Log entry / exit: guard users or admins
router.post('/entry', protect, allowRolesOrUserTypes(['admin', 'super_admin'], ['guard']), logEntry);
router.put('/exit/:id', protect, allowRolesOrUserTypes(['admin', 'super_admin'], ['guard']), logExit);

module.exports = router;

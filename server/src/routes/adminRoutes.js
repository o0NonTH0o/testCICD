const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

// Base path: /api/admin
router.post('/periods', authMiddleware, adminController.setApplicationPeriod);
router.get('/periods', authMiddleware, adminController.getPeriods);

module.exports = router;

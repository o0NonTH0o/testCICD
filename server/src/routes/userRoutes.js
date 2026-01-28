const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware'); // เรียก Middleware ตรวจ Token

// User ยื่นเรื่อง (Onboard)
router.post('/onboard', authMiddleware, userController.onboardUser);

// Admin อนุมัติ (Approve)
router.patch('/:id/approve', authMiddleware, userController.approveUser);

module.exports = router;
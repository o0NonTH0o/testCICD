const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware'); // เรียก Middleware ตรวจ Token

// GET /api/users - Admin ดูรายชื่อ User (เช่น ?status=PENDING_APPROVAL)
router.get('/', authMiddleware, userController.getUsers);

// GET /api/users/me - ดึงข้อมูล User ปัจจุบัน
router.get('/me', authMiddleware, userController.getMe);

// User ยื่นเรื่อง (Onboard)
router.post('/onboard', authMiddleware, userController.onboardUser);

// Admin อนุมัติ (Approve)
router.patch('/:id/approve', authMiddleware, userController.approveUser);

module.exports = router;
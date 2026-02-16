const express = require('express');
const router = express.Router();
const controller = require('../controllers/applicationController');
const authMiddleware = require('../middlewares/authMiddleware');

// GET /api/applications - ดูใบสมัครทั้งหมด (อาจจะใส่ Filter userId ได้)
// ใส่ Auth Middleware เพื่อให้รู้ว่าเป็นใคร
router.get('/', authMiddleware, controller.getApplications);

// GET /api/applications/:id - ดูรายละเอียดใบสมัครรายใบ
router.get('/:id', authMiddleware, controller.getApplicationById);

// POST /api/applications/apply - นิสิตส่งใบสมัคร
router.post('/apply', authMiddleware, controller.createApplication);

// PATCH /api/applications/:id/status - ผู้บริหารกดอนุมัติ/ตีกลับ
router.patch('/:id/status', authMiddleware, controller.updateStatus);

module.exports = router;
const express = require('express');
const router = express.Router();
const controller = require('../controllers/applicationController');

// GET /api/applications - ดูใบสมัครทั้งหมด (อาจจะใส่ Filter userId ได้)
router.get('/', controller.getApplications);

// POST /api/applications/apply - นิสิตส่งใบสมัคร
router.post('/apply', controller.createApplication);

// PATCH /api/applications/:id/status - ผู้บริหารกดอนุมัติ/ตีกลับ
router.patch('/:id/status', controller.updateStatus);

module.exports = router;
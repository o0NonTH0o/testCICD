const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// 1. วิ่งไปหน้า Login ของ Google
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

// 2. Google ส่ง User กลับมาที่นี่ (Callback)
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // เช็ค User Status เพื่อ Redirect ไปยังหน้าที่เหมาะสม
    if (user.status === 'PENDING_ONBOARDING') {
      // 1. ยังไม่เคยกรอกข้อมูล -> ไปหน้ากรอก
      return res.redirect(`${process.env.CLIENT_URL}/auth/onboarding?token=${token}`);
    } else if (user.status === 'PENDING_APPROVAL') {
      // 2. กรอกแล้ว รออนุมัติ -> ไปหน้า "รอสักครู่"
      return res.redirect(`${process.env.CLIENT_URL}/auth/pending?token=${token}`);
    } else if (user.status === 'ACTIVE') {
      // 3. ผ่านแล้ว -> เข้าใช้งานได้
      return res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
    } else {
      // กรณีอื่นๆ หรือ REJECTED
      return res.redirect(`${process.env.CLIENT_URL}/auth/reject?token=${token}`);
    }
  }
);

module.exports = router;
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ดึง role และข้อมูลล่าสุดจาก DB เสมอ เพื่อให้ role ที่เปลี่ยนมีผลทันที
    const freshUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!freshUser) return res.status(401).json({ error: 'User not found' });

    req.user = freshUser; // ใช้ข้อมูลสดแทน payload ใน token
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid Token' });
  }
};
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // แปะข้อมูล user ไว้ใน request
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid Token' });
  }
};
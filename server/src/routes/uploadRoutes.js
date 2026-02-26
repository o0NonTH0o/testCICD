const express = require('express');
const router = express.Router();
const upload = require('../middleware/fileUpload');

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // ⭐ สำคัญ: ต้องมี result จาก cloudinary
  const result = req.file.cloudinary; 
  // (หรือค่าที่ middleware ของคุณส่งมา)

  res.json({
    url: result.secure_url   // ⭐ แก้ตรงนี้
  });
});

module.exports = router;
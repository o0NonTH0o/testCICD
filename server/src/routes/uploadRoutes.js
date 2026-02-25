const express = require('express');
const router = express.Router();
const upload = require('../middleware/fileUpload');

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.json({
    url: fileUrl
  });
});

module.exports = router;
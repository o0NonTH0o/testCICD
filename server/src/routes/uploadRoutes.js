const express = require('express');
const router = express.Router();
const upload = require('../middleware/fileUpload');

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Multer-S3 adds a 'location' property to the file object
  // However, with MinIO running in Docker and the server running locally,
  // the 'location' might be using the internal Docker hostname (e.g. http://p2-project-minio:9000/...)
  // The client browser (on host machine) needs 'localhost'.
  
  let fileUrl = req.file.location;
  
  // If in development mode and using local MinIO, replace hostname
  if (process.env.NODE_ENV !== 'production') {
      // Replace the internal docker hostname with localhost if present
      // Typically minio endpoint is set to localhost in .env for the server to talk to it.
      // But if the server sees "localhost", it puts "localhost" in the URL.
      // If the server was INSIDE docker, it would use the service name.
      // Since server is OUTSIDE docker (npm run dev), it talks to localhost:9000.
      // So req.file.location should already be localhost:9000.
      
      // Just in case s3Client config used something else or returned http://minio:9000
      // We can force it for safety if needed. 
      // For now, let's assume req.file.location is correct if s3.js is configured with localhost.
  }

  res.json({
    message: 'File uploaded successfully',
    filename: req.file.key,
    fileUrl: fileUrl,  // For frontend compatibility
    location: fileUrl,
    contentType: req.file.mimetype,
  });
});

module.exports = router;

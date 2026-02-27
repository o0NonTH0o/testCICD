const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ตั้งค่า Cloudinary (ค่าเหล่านี้จะดึงมาจาก Environment Variables ใน Railway)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ตั้งค่าการเก็บไฟล์ไปที่ Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop();
    const isPDF = file.mimetype === 'application/pdf';

    return {
      folder: 'student_applications',
      resource_type: isPDF ? 'raw' : 'auto',
      public_id: file.fieldname + '-' + Date.now(),
      format: ext,

      type: 'upload',   // ⭐⭐ ตัวนี้สำคัญสุด
    };
  },
});

// กรองไฟล์เหมือนเดิม
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  if (allowedTypes.test(file.mimetype) || allowedTypes.test(file.originalname.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and Word documents are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = upload;
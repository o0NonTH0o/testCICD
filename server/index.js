const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Import 2 เส้นทางนี้
const applicationRoutes = require('./src/routes/applicationRoutes');
const authRoutes = require('./src/routes/authRoutes'); // <-- เพิ่มบรรทัดนี้ครับ!

const passport = require('./src/config/passport'); // Import Passport Config

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Use Routes
app.use('/api/applications', applicationRoutes);
app.use('/auth', authRoutes); // ตอนนี้ตัวแปร authRoutes มีค่าแล้ว ใช้งานได้

// 3. เพิ่มบรรทัดนี้เพื่อเรียกใช้ userRoutes
const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', userRoutes); 

const masterDataRoutes = require('./src/routes/masterDataRoutes');
app.use('/api/master', masterDataRoutes);

const adminRoutes = require('./src/routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const uploadRoutes = require('./src/routes/uploadRoutes');
app.use('/api/files', uploadRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Server!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

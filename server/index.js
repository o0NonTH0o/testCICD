const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('./src/config/passport');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());


/* ================= ROUTES ================= */

app.use('/api/applications', require('./src/routes/applicationRoutes'));
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/master', require('./src/routes/masterDataRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/files', require('./src/routes/uploadRoutes'));

/* ================= ROOT ================= */

app.get('/', (req, res) => {
  res.send('Hello from Server!');
});

/* ================= START ================= */

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
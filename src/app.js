require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: ['http://localhost:5173', 'https://smart-healthcare-xi.vercel.app'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(mongoSanitize());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login',           authLimiter);
app.use('/api/auth/register',        authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/ai',           require('./routes/ai'));
app.use('/api/user',         require('./routes/user'));
app.use('/api/patient',      require('./routes/patient'));
app.use('/api/doctor',       require('./routes/doctor'));
app.use('/api/admin',        require('./routes/admin'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/diagnosis',    require('./routes/diagnosis'));
app.use('/api/upload',       require('./routes/upload'));

app.get('/api/health', (_, res) => res.json({ success: true, data: { status: 'Server is running' } }));
app.use((_, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

connectDB().then(() =>
  app.listen(process.env.PORT || 5000, () => {
    if (process.env.NODE_ENV !== 'production') console.log(`Server running on port ${process.env.PORT || 5000}`);
  })
).catch(err => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

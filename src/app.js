require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://smart-healthcare-xi.vercel.app'],
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

connectDB().then(() =>
  app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
  )
);

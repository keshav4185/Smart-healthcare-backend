require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const users = [
  { name: 'Demo Patient', email: 'patient@demo.com', password: 'patient123', role: 'patient', phone: '9876543210' },
  { name: 'Dr. Demo Doctor', email: 'doctor@demo.com', password: 'doctor123', role: 'doctor', phone: '9876543211', specialty: 'General Physician', licenseNumber: 'MH-12345', hospital: 'City Hospital', experience: 5, education: 'MBBS, MD', status: 'verified' },
  { name: 'Admin', email: 'admin@healthcare.com', password: 'admin@123', role: 'admin', phone: '9876543212' },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connected');
  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      await User.deleteOne({ email: u.email });
      console.log(`Deleted existing: ${u.email}`);
    }
    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, password: hashed });
    console.log(`Created: ${u.email}`);
  }
  console.log('\n✅ Seed complete! Demo users ready.');
  process.exit(0);
}).catch(err => { console.error(err.message); process.exit(1); });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  phone: { type: String },
  address: { type: String },

  // Patient fields
  dob: { type: Date },
  bloodGroup: { type: String },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },

  // Doctor fields
  specialty: { type: String },
  licenseNumber: { type: String },
  hospital: { type: String },
  experience: { type: Number },
  education: { type: String },
  certificate: { type: String },
  documents: {
    degreeCertificate: { type: String, default: '' },
    idProof: { type: String, default: '' },
    selfieWithId: { type: String, default: '' },
  },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  rating: { type: Number, default: 0 },
  fee: { type: Number },
  available: { type: Boolean, default: true },

  profilePhoto: { type: String, default: '' },
  refreshToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

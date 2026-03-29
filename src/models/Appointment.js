const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  reason: { type: String },
  symptoms: [{ type: String }],
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  fee: { type: Number },
  type: { type: String, enum: ['In-person', 'Video'], default: 'In-person' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);

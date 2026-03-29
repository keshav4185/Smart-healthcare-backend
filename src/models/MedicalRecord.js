const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['Lab Report', 'Prescription', 'X-Ray', 'CT Scan', 'MRI', 'MRI Scan'], required: true },
  title: { type: String, required: true },
  fileUrl: { type: String },
  fileSize: { type: String },
  symptoms: [{ type: String }],
  findings: { type: String },
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);

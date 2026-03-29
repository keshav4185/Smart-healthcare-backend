const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symptoms: [{ type: String }],
  severity: { type: String },
  duration: { type: String },
  condition: { type: String },
  specialist: { type: String },
  urgency: { type: String },
  recommendations: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Diagnosis', diagnosisSchema);

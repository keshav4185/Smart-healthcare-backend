const Diagnosis = require('../models/Diagnosis');
const { SYMPTOM_RULES, DEFAULT_DIAGNOSIS } = require('../constants/symptoms');

const matchSymptoms = (symptoms) => {
  const lower = symptoms.map((s) => s.toLowerCase());
  return SYMPTOM_RULES.find((rule) =>
    rule.keywords.some((kw) => lower.some((s) => s.includes(kw)))
  ) || DEFAULT_DIAGNOSIS;
};

const predictAndSave = async (patientId, { symptoms, severity, duration }) => {
  const matched = matchSymptoms(symptoms);

  return Diagnosis.create({
    patientId,
    symptoms,
    severity,
    duration,
    condition: matched.condition,
    specialist: matched.specialist,
    urgency: matched.urgency,
    recommendations: `Please consult a ${matched.specialist}. ${
      matched.urgency === 'High'
        ? 'Seek immediate medical attention.'
        : 'Schedule an appointment at your earliest convenience.'
    }`,
  });
};

const fetchDiagnosisHistory = (patientId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return Promise.all([
    Diagnosis.find({ patientId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Diagnosis.countDocuments({ patientId }),
  ]).then(([diagnoses, total]) => ({ diagnoses, total, page, pages: Math.ceil(total / limit) }));
};

module.exports = { predictAndSave, fetchDiagnosisHistory };

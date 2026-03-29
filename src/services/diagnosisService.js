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

const fetchDiagnosisHistory = (patientId) =>
  Diagnosis.find({ patientId }).sort({ createdAt: -1 });

module.exports = { predictAndSave, fetchDiagnosisHistory };

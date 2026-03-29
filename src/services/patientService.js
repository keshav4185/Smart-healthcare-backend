const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Diagnosis = require('../models/Diagnosis');
const { SYMPTOM_RULES, DEFAULT_DIAGNOSIS } = require('../constants/symptoms');

const getPatientDashboard = async (patientId) => {
  const [appointments, records, diagnoses] = await Promise.all([
    Appointment.find({ patientId })
      .populate('doctorId', 'name specialty hospital')
      .sort({ date: -1 })
      .limit(5),
    MedicalRecord.find({ patientId }).sort({ createdAt: -1 }).limit(5),
    Diagnosis.find({ patientId }).sort({ createdAt: -1 }).limit(3),
  ]);
  return { appointments, records, diagnoses };
};

const getPatientAppointments = (patientId) =>
  Appointment.find({ patientId })
    .populate('doctorId', 'name specialty hospital fee')
    .sort({ date: -1 });

const getPatientMedicalRecords = (patientId) =>
  MedicalRecord.find({ patientId })
    .populate('doctorId', 'name specialty')
    .sort({ createdAt: -1 });

const analyzeSymptoms = async (patientId, { symptoms, severity, duration }) => {
  const lowerSymptoms = symptoms.map((s) => s.toLowerCase());

  const matched = SYMPTOM_RULES.find((rule) =>
    rule.keywords.some((kw) => lowerSymptoms.some((s) => s.includes(kw)))
  ) || DEFAULT_DIAGNOSIS;

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

module.exports = { getPatientDashboard, getPatientAppointments, getPatientMedicalRecords, analyzeSymptoms };

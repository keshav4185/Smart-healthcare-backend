const patientService = require('../services/patientService');
const { sendSuccess, sendError } = require('../utils/response');

const getDashboard = async (req, res) => {
  try {
    const data = await patientService.getPatientDashboard(req.user._id);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message);
  }
};

const getAppointments = async (req, res) => {
  try {
    const data = await patientService.getPatientAppointments(req.user._id);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message);
  }
};

const getMedicalRecords = async (req, res) => {
  try {
    const data = await patientService.getPatientMedicalRecords(req.user._id);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message);
  }
};

const checkSymptoms = async (req, res) => {
  try {
    const data = await patientService.analyzeSymptoms(req.user._id, req.body);
    sendSuccess(res, data, 201);
  } catch (err) {
    sendError(res, err.message);
  }
};

module.exports = { getDashboard, getAppointments, getMedicalRecords, checkSymptoms };

const doctorService = require('../services/doctorService');
const { sendSuccess, sendError } = require('../utils/response');

const getDashboard = async (req, res) => {
  try {
    const data = await doctorService.getDoctorDashboard(req.user._id);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message);
  }
};

const getAppointments = async (req, res) => {
  try {
    const data = await doctorService.getDoctorAppointments(req.user._id);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message);
  }
};

const getPatients = async (req, res) => {
  try {
    const data = await doctorService.getDoctorPatients(req.user._id);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message);
  }
};

const updateDiagnosis = async (req, res) => {
  try {
    const data = await doctorService.createMedicalRecord(req.user._id, req.body);
    sendSuccess(res, data, 201);
  } catch (err) {
    sendError(res, err.message);
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const data = await doctorService.toggleAvailability(req.user._id);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message);
  }
};

module.exports = { getDashboard, getAppointments, getPatients, updateDiagnosis, toggleAvailability };

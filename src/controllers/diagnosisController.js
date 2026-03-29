const diagnosisService = require('../services/diagnosisService');
const { sendSuccess, sendError } = require('../utils/response');

const predictDiagnosis = async (req, res) => {
  try {
    const data = await diagnosisService.predictAndSave(req.user._id, req.body);
    sendSuccess(res, data, 201);
  } catch (err) {
    sendError(res, err.message);
  }
};

const getDiagnosisHistory = async (req, res) => {
  try {
    const data = await diagnosisService.fetchDiagnosisHistory(req.user._id);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message);
  }
};

module.exports = { predictDiagnosis, getDiagnosisHistory };

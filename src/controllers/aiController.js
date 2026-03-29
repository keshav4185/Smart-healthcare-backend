const gemini = require('../services/geminiService');
const { sendSuccess, sendError } = require('../utils/response');

const diagnose = async (req, res) => {
  try {
    const { symptoms, severity = 'moderate', duration = 'unknown' } = req.body;
    if (!symptoms?.length) return sendError(res, 'symptoms array is required', 400);
    const result = await gemini.diagnose({ symptoms, severity, duration });
    sendSuccess(res, result);
  } catch (err) {
    console.error('[AI /diagnose error]', err);
    sendError(res, err.message);
  }
};

const scanAnalysis = async (req, res) => {
  try {
    if (!req.file) return sendError(res, 'Image file is required', 400);
    const { scanType = 'medical', symptoms } = req.body;
    const imageBase64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const parsedSymptoms = symptoms ? JSON.parse(symptoms) : [];
    const result = await gemini.analyzeScan({ imageBase64, mimeType, scanType, symptoms: parsedSymptoms });
    sendSuccess(res, result);
  } catch (err) {
    console.error('[AI /scan-analysis error]', err);
    sendError(res, err.message);
  }
};

module.exports = { diagnose, scanAnalysis };

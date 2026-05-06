const gemini = require('../services/geminiService');
const { sendSuccess, sendError } = require('../utils/response');
const PDFDocument = require('pdfkit');

const diagnose = async (req, res) => {
  try {
    const { symptoms, severity = 'moderate', duration = 'unknown' } = req.body;
    if (!symptoms?.length) return sendError(res, 'symptoms array is required', 400);
    if (!Array.isArray(symptoms)) return sendError(res, 'symptoms must be an array', 400);
    const result = await gemini.diagnose({ symptoms, severity, duration });
    sendSuccess(res, result);
  } catch (err) {
    if (err.status === 429) return sendError(res, 'AI quota exceeded. Please wait a minute and try again.', 429);
    sendError(res, err.message);
  }
};

const scanAnalysis = async (req, res) => {
  try {
    if (!req.file) return sendError(res, 'Image file is required', 400);
    const { scanType = 'medical', symptoms } = req.body;
    const imageBase64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const parsedSymptoms = symptoms ? (() => { try { return JSON.parse(symptoms); } catch { return []; } })() : [];

    const isValid = await gemini.validateMedicalImage({ imageBase64, mimeType, scanType });
    if (!isValid) {
      return sendError(res, 'The uploaded image does not appear to be a medical scan. Please upload a valid medical image.', 422);
    }

    const result = await gemini.analyzeScan({ imageBase64, mimeType, scanType, symptoms: parsedSymptoms });
    sendSuccess(res, result);
  } catch (err) {
    if (err.status === 429) return sendError(res, 'AI quota exceeded. Please wait a minute and try again.', 429);
    sendError(res, err.message);
  }
};

const downloadReport = (req, res) => {
  try {
    const { finding, predicted_symptoms_en, predicted_symptoms_mr, possible_conditions, severity, affected_area, recommendation, scanType = 'Medical' } = req.body;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=scan-report.pdf');
    doc.pipe(res);

    const section = (title, content) => {
      doc.fontSize(13).fillColor('#1a73e8').text(title);
      doc.fontSize(11).fillColor('#222').text(Array.isArray(content) ? content.map((c, i) => `${i + 1}. ${c}`).join('\n') : (content || 'N/A'));
      doc.moveDown(0.8);
    };

    doc.fontSize(20).fillColor('#1a73e8').text('Smart Healthcare - Scan Analysis Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#555').text(`Scan Type: ${scanType}  |  Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#1a73e8').stroke();
    doc.moveDown(1);

    section('Finding', finding);
    section('Predicted Symptoms (English)', predicted_symptoms_en);
    section('Predicted Symptoms (Marathi - Unicode)', predicted_symptoms_mr);
    section('Possible Conditions', possible_conditions);
    section('Severity', severity);
    section('Affected Area', affected_area);
    section('Recommendation', recommendation);

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#ccc').stroke();
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor('#aaa').text('This report is AI-generated and should not replace professional medical advice.', { align: 'center' });

    doc.end();
  } catch (err) {
    sendError(res, err.message);
  }
};

const downloadDiagnosis = (req, res) => {
  try {
    const { condition, specialist, urgency, recommendations, home_therapy, home_therapy_mr, symptoms } = req.body;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=diagnosis-report.pdf');
    doc.pipe(res);

    const section = (title, content) => {
      doc.fontSize(13).fillColor('#1a73e8').text(title);
      doc.fontSize(11).fillColor('#222').text(Array.isArray(content) ? content.map((c, i) => `${i + 1}. ${c}`).join('\n') : (content || 'N/A'));
      doc.moveDown(0.8);
    };

    doc.fontSize(20).fillColor('#1a73e8').text('Smart Healthcare - Diagnosis Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#555').text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#1a73e8').stroke();
    doc.moveDown(1);

    section('Symptoms Reported', symptoms);
    section('Condition', condition);
    section('Specialist to Consult', specialist);
    section('Urgency', urgency);
    section('Recommendations', recommendations);
    section('Home Therapy (English)', home_therapy);
    section('Home Therapy (Marathi - Unicode)', home_therapy_mr);

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#ccc').stroke();
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor('#aaa').text('This report is AI-generated. Home therapies are safe suggestions only. Consult a doctor for proper treatment.', { align: 'center' });

    doc.end();
  } catch (err) {
    sendError(res, err.message);
  }
};

module.exports = { diagnose, scanAnalysis, downloadReport, downloadDiagnosis };

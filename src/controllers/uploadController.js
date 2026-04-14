const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

const uploadScan = async (req, res) => {
  try {
    if (!req.file) return sendError(res, 'No file uploaded', 400);

    const { type, symptoms, findings } = req.body;
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const record = await MedicalRecord.create({
      patientId: req.user._id,
      type: type || 'X-Ray',
      title: `${type || 'Scan'} - ${new Date().toLocaleDateString('en-IN')}`,
      fileUrl,
      fileSize: `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`,
      status: 'Completed',
      symptoms: symptoms ? symptoms.split(',').map(s => s.trim()) : [],
      findings: findings || '',
    });

    sendSuccess(res, record, 201);
  } catch (err) {
    sendError(res, err.message);
  }
};

const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return sendError(res, 'No file uploaded', 400);

    const photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePhoto: photoUrl },
      { new: true }
    ).select('-password -refreshToken');

    sendSuccess(res, user);
  } catch (err) {
    sendError(res, err.message);
  }
};

module.exports = { uploadScan, uploadProfilePhoto };

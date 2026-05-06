const router = require('express').Router();
const { getDashboard, getAppointments, getMedicalRecords, checkSymptoms } = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { getAllDoctors } = require('../services/adminService');
const { sendSuccess, sendError } = require('../utils/response');

// Public to any authenticated user — patients need to browse verified doctors
router.get('/doctors', protect, async (req, res) => {
  try {
    const result = await getAllDoctors('verified', 1, 1000);
    sendSuccess(res, result.doctors);
  } catch (err) {
    sendError(res, err.message);
  }
});

// Get single doctor by ID
router.get('/doctors/:id', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor', status: 'verified' }).select('-password -refreshToken');
    if (!doctor) return sendError(res, 'Doctor not found', 404);
    sendSuccess(res, doctor);
  } catch (err) {
    sendError(res, err.message);
  }
});

router.use(protect, authorizeRoles('patient'));

router.get('/dashboard', getDashboard);
router.get('/appointments', getAppointments);
router.get('/medical-records', getMedicalRecords);
router.post('/symptoms', checkSymptoms);

// Prescriptions written by doctors
router.get('/prescriptions', async (req, res) => {
  try {
    const MedicalRecord = require('../models/MedicalRecord');
    const records = await MedicalRecord.find({ patientId: req.user._id, type: 'Prescription' })
      .populate('doctorId', 'name specialty')
      .sort({ createdAt: -1 });
    sendSuccess(res, records);
  } catch (err) { sendError(res, err.message); }
});

module.exports = router;

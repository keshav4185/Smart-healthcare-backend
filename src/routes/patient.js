const router = require('express').Router();
const { getDashboard, getAppointments, getMedicalRecords, checkSymptoms } = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { getAllDoctors } = require('../services/adminService');
const { sendSuccess, sendError } = require('../utils/response');

// Public to any authenticated user — patients need to browse verified doctors
router.get('/doctors', protect, async (req, res) => {
  try {
    const data = await getAllDoctors('verified');
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message);
  }
});

router.use(protect, authorizeRoles('patient'));

router.get('/dashboard', getDashboard);
router.get('/appointments', getAppointments);
router.get('/medical-records', getMedicalRecords);
router.post('/symptoms', checkSymptoms);

module.exports = router;

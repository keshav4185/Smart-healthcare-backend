const router = require('express').Router();
const { getDashboard, getAppointments, getPatients, updateDiagnosis, toggleAvailability } = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect, authorizeRoles('doctor'));

router.get('/dashboard', getDashboard);
router.get('/appointments', getAppointments);
router.get('/patients', getPatients);
router.put('/diagnosis', updateDiagnosis);
router.put('/toggle-availability', toggleAvailability);

// Get a specific patient's medical records (for doctor view)
router.get('/patient-records/:patientId', async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patientId: req.params.patientId })
      .sort({ createdAt: -1 });
    sendSuccess(res, records);
  } catch (err) {
    sendError(res, err.message);
  }
});

// Save prescription (best-effort — stores as a MedicalRecord note)
const MedicalRecord = require('../models/MedicalRecord');
const { sendSuccess, sendError } = require('../utils/response');
router.post('/prescription', async (req, res) => {
  try {
    const { patientId, medicine, dosage, notes } = req.body;
    if (!patientId) return sendError(res, 'patientId required', 400);
    const record = await MedicalRecord.create({
      patientId,
      doctorId: req.user._id,
      type: 'Prescription',
      title: `Prescription — ${medicine || 'General'}`,
      findings: `Medicine: ${medicine}\nDosage: ${dosage}\nNotes: ${notes}`,
      status: 'Active',
    });
    sendSuccess(res, record, 201);
  } catch (err) {
    sendError(res, err.message);
  }
});

module.exports = router;

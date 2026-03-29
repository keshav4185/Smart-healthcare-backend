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

module.exports = router;

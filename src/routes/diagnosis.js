const router = require('express').Router();
const { predictDiagnosis, getDiagnosisHistory } = require('../controllers/diagnosisController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect, authorizeRoles('patient'));

router.post('/predict', predictDiagnosis);
router.get('/history', getDiagnosisHistory);

module.exports = router;

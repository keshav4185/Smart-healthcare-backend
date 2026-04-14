const router = require('express').Router();
const multer = require('multer');
const { diagnose, scanAnalysis, downloadReport, downloadDiagnosis } = require('../controllers/aiController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/diagnose', diagnose);
router.post('/scan-analysis', upload.single('image'), scanAnalysis);
router.post('/download-report', downloadReport);
router.post('/download-diagnosis', downloadDiagnosis);

module.exports = router;

const router = require('express').Router();
const multer = require('multer');
const { diagnose, scanAnalysis } = require('../controllers/aiController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/diagnose', diagnose);
router.post('/scan-analysis', upload.single('image'), scanAnalysis);

module.exports = router;

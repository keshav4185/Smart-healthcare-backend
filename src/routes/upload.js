const router = require('express').Router();
const { uploadScan, uploadProfilePhoto } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// POST /api/upload/scan
router.post('/scan', protect, upload.single('file'), uploadScan);

// POST /api/upload/photo
router.post('/photo', protect, upload.single('photo'), uploadProfilePhoto);

module.exports = router;

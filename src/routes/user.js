const router = require('express').Router();
const { getProfile, updateProfile, changePassword, uploadPhoto } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

router.get('/profile', protect, getProfile);
router.put('/update', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/upload-photo', protect, upload.single('photo'), uploadPhoto);

module.exports = router;

const router = require('express').Router();
const { register, login, logout, refresh, forgotPassword, resetPassword } = require('../controllers/authController');
const { upload } = require('../config/cloudinary');

const docUpload = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'degreeCertificate', maxCount: 1 },
  { name: 'idProof', maxCount: 1 },
  { name: 'selfieWithId', maxCount: 1 },
]);

const conditionalUpload = (req, res, next) => {
  if (req.headers['content-type']?.startsWith('multipart/form-data')) {
    return docUpload(req, res, next);
  }
  next();
};

router.post('/register', conditionalUpload, register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;

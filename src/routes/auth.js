const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { register, login, logout, refresh, forgotPassword, resetPassword } = require('../controllers/authController');
const { upload } = require('../config/cloudinary');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

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

router.post('/register',
  conditionalUpload,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').isIn(['patient', 'doctor']).withMessage('Role must be patient or doctor'),
    body('phone').matches(/^\d{10}$/).withMessage('Phone must be exactly 10 digits'),
  ],
  validate,
  register
);

router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post('/logout', logout);
router.post('/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  validate,
  refresh
);

router.post('/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required').normalizeEmail()],
  validate,
  forgotPassword
);

router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  resetPassword
);

module.exports = router;

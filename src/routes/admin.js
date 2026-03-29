const router = require('express').Router();
const { getDashboard, getDoctors, updateDoctorStatus } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect, authorizeRoles('admin'));

router.get('/dashboard', getDashboard);
router.get('/doctors', getDoctors);
router.put('/doctors/:id', updateDoctorStatus);

module.exports = router;

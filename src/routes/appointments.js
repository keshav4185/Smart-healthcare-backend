const router = require('express').Router();
const { createAppointment, updateAppointment, rescheduleAppointment, cancelAppointment, getBookedSlots } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/booked-slots',      protect, getBookedSlots);
router.post('/create',           protect, createAppointment);
router.put('/update/:id',        protect, updateAppointment);
router.put('/reschedule/:id',    protect, rescheduleAppointment);
router.delete('/cancel/:id',     protect, cancelAppointment);

module.exports = router;

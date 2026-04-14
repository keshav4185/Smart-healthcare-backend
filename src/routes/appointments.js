const router = require('express').Router();
const { createAppointment, updateAppointment, cancelAppointment, getBookedSlots } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/booked-slots', protect, getBookedSlots);
router.post('/create', protect, createAppointment);
router.put('/update/:id', protect, updateAppointment);
router.delete('/cancel/:id', protect, cancelAppointment);

// Reschedule — patient picks new date + timeSlot
router.put('/reschedule/:id', protect, async (req, res) => {
  const { sendSuccess, sendError } = require('../utils/response');
  const Appointment = require('../models/Appointment');
  const { sendAppointmentEmail } = require('../utils/emailService');
  try {
    const { date, timeSlot } = req.body;
    if (!date || !timeSlot) return sendError(res, 'date and timeSlot required', 400);
    const apt = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email').populate('doctorId', 'name');
    if (!apt) return sendError(res, 'Appointment not found', 404);
    if (apt.patientId._id.toString() !== req.user._id.toString()) return sendError(res, 'Not authorized', 403);
    if (!['pending', 'confirmed'].includes(apt.status)) return sendError(res, 'Cannot reschedule this appointment', 400);
    // Check new slot availability
    const conflict = await Appointment.findOne({ doctorId: apt.doctorId._id, date: new Date(date), timeSlot, status: { $in: ['pending', 'confirmed'] }, _id: { $ne: apt._id } });
    if (conflict) return sendError(res, 'This time slot is already booked. Please choose another.', 409);
    apt.date = new Date(date);
    apt.timeSlot = timeSlot;
    apt.status = 'pending';
    await apt.save();
    try {
      await sendAppointmentEmail({ toEmail: apt.patientId.email, patientName: apt.patientId.name, doctorName: apt.doctorId.name, date, timeSlot, status: 'rescheduled', reason: apt.reason });
    } catch { /* best-effort */ }
    sendSuccess(res, apt);
  } catch (err) { sendError(res, err.message); }
});

module.exports = router;

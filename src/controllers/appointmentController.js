const appointmentService = require('../services/appointmentService');
const { sendSuccess, sendError } = require('../utils/response');

const createAppointment = async (req, res) => {
  try {
    const data = await appointmentService.bookAppointment(req.user._id, req.body);
    sendSuccess(res, data, 201);
  } catch (err) {
    sendError(res, err.message, err.statusCode || 500);
  }
};

const getBookedSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return sendError(res, 'doctorId and date required', 400);
    const slots = await appointmentService.getBookedSlots(doctorId, date);
    sendSuccess(res, { bookedSlots: slots });
  } catch (err) {
    sendError(res, err.message);
  }
};

const updateAppointment = async (req, res) => {
  try {
    const data = await appointmentService.modifyAppointment(req.params.id, req.user, req.body);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err.message, err.statusCode || 500);
  }
};

const cancelAppointment = async (req, res) => {
  try {
    await appointmentService.cancelAppointmentById(req.params.id, req.user);
    sendSuccess(res, { message: 'Appointment cancelled' });
  } catch (err) {
    sendError(res, err.message, err.statusCode || 500);
  }
};

module.exports = { createAppointment, updateAppointment, cancelAppointment, getBookedSlots };

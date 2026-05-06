const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { ROLES, DOCTOR_STATUS, APPOINTMENT_STATUS } = require('../constants/roles');
const { sendAppointmentEmail } = require('../utils/emailService');

const _sendEmail = async (appointment, status) => {
  try {
    const apt = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name');
    if (apt?.patientId?.email) {
      await sendAppointmentEmail({
        toEmail: apt.patientId.email,
        patientName: apt.patientId.name,
        doctorName: apt.doctorId.name,
        date: apt.date,
        timeSlot: apt.timeSlot,
        status,
        reason: apt.reason,
      });
    }
  } catch { /* email is best-effort */ }
};

const bookAppointment = async (patientId, body) => {
  const { doctorId, date, timeSlot, reason, symptoms, type } = body;

  if (!doctorId || !date || !timeSlot) {
    const err = new Error('doctorId, date and timeSlot are required');
    err.statusCode = 400;
    throw err;
  }

  const doctor = await User.findOne({ _id: doctorId, role: ROLES.DOCTOR, status: DOCTOR_STATUS.VERIFIED });
  if (!doctor) {
    const err = new Error('Doctor not found or not verified');
    err.statusCode = 404;
    throw err;
  }

  // Check duplicate slot
  const existing = await Appointment.findOne({
    doctorId,
    date: new Date(date),
    timeSlot,
    status: { $in: ['pending', 'confirmed'] },
  });
  if (existing) {
    const err = new Error('This time slot is already booked. Please choose another.');
    err.statusCode = 409;
    throw err;
  }

  const appointment = await Appointment.create({
    patientId,
    doctorId,
    date: new Date(date),
    timeSlot,
    reason,
    symptoms: Array.isArray(symptoms) ? symptoms : symptoms ? [symptoms] : [],
    type: type || 'In-person',
    fee: doctor.fee || 0,
    status: 'pending',
  });

  await appointment.populate('doctorId', 'name specialty hospital fee');
  _sendEmail(appointment, 'booked');
  return appointment;
};

// Get booked slots for a doctor on a date
const getBookedSlots = async (doctorId, date) => {
  const appointments = await Appointment.find({
    doctorId,
    date: new Date(date),
    status: { $in: ['pending', 'confirmed'] },
  }).select('timeSlot');
  return appointments.map(a => a.timeSlot);
};

const modifyAppointment = async (appointmentId, requestingUser, updates) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  const isPatient = appointment.patientId.toString() === requestingUser._id.toString();
  const isDoctor = appointment.doctorId.toString() === requestingUser._id.toString();
  if (!isPatient && !isDoctor) {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }

  const updated = await Appointment.findByIdAndUpdate(appointmentId, updates, { new: true })
    .populate('doctorId', 'name specialty')
    .populate('patientId', 'name email');
  if (updates.status) _sendEmail(updated, updates.status);
  return updated;
};

const rescheduleAppointment = async (appointmentId, requestingUser, { date, timeSlot }) => {
  if (!date || !timeSlot) {
    const err = new Error('date and timeSlot required');
    err.statusCode = 400;
    throw err;
  }

  const apt = await Appointment.findById(appointmentId)
    .populate('patientId', 'name email')
    .populate('doctorId', 'name');
  if (!apt) throw Object.assign(new Error('Appointment not found'), { statusCode: 404 });
  if (apt.patientId._id.toString() !== requestingUser._id.toString())
    throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
  if (!['pending', 'confirmed'].includes(apt.status))
    throw Object.assign(new Error('Cannot reschedule this appointment'), { statusCode: 400 });

  const conflict = await Appointment.findOne({
    doctorId: apt.doctorId._id,
    date: new Date(date),
    timeSlot,
    status: { $in: ['pending', 'confirmed'] },
    _id: { $ne: apt._id },
  });
  if (conflict) throw Object.assign(new Error('This time slot is already booked. Please choose another.'), { statusCode: 409 });

  apt.date = new Date(date);
  apt.timeSlot = timeSlot;
  apt.status = 'pending';
  await apt.save();

  try {
    await sendAppointmentEmail({
      toEmail: apt.patientId.email,
      patientName: apt.patientId.name,
      doctorName: apt.doctorId.name,
      date, timeSlot, status: 'rescheduled', reason: apt.reason,
    });
  } catch { /* best-effort */ }

  return apt;
};

const cancelAppointmentById = async (appointmentId, requestingUser) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  const isPatient = appointment.patientId.toString() === requestingUser._id.toString();
  if (!isPatient && requestingUser.role !== ROLES.ADMIN) {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }

  appointment.status = APPOINTMENT_STATUS.CANCELLED;
  await appointment.save();
};

module.exports = { bookAppointment, modifyAppointment, cancelAppointmentById, getBookedSlots, rescheduleAppointment };

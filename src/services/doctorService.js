const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const { APPOINTMENT_STATUS } = require('../constants/roles');

const getDoctorDashboard = async (doctorId) => {
  const [appointments, patientIds] = await Promise.all([
    Appointment.find({ doctorId })
      .populate('patientId', 'name email phone')
      .sort({ date: -1 })
      .limit(5),
    Appointment.distinct('patientId', { doctorId }),
  ]);
  return { appointments, totalPatients: patientIds.length, available: (await User.findById(doctorId).select('available')).available };
};

const getDoctorAppointments = (doctorId) =>
  Appointment.find({ doctorId })
    .populate('patientId', 'name email phone dob bloodGroup')
    .sort({ date: -1 });

const getDoctorPatients = async (doctorId) => {
  const patientIds = await Appointment.distinct('patientId', { doctorId });
  return User.find({ _id: { $in: patientIds } }).select('-password -refreshToken');
};

const createMedicalRecord = async (doctorId, { appointmentId, title, type, fileUrl, fileSize, patientId }) => {
  const record = await MedicalRecord.create({
    patientId,
    doctorId,
    title,
    type,
    fileUrl,
    fileSize,
    status: 'Active',
  });

  if (appointmentId) {
    await Appointment.findByIdAndUpdate(appointmentId, { status: APPOINTMENT_STATUS.COMPLETED });
  }

  return record;
};

const toggleAvailability = async (doctorId) => {
  const doctor = await User.findById(doctorId);
  if (!doctor) throw new Error('Doctor not found');
  doctor.available = !doctor.available;
  await doctor.save();
  return { available: doctor.available };
};

module.exports = { getDoctorDashboard, getDoctorAppointments, getDoctorPatients, createMedicalRecord, toggleAvailability };
